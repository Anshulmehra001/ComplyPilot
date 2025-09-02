import os
from datetime import datetime, timedelta
from typing import Optional
import requests
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, inspect
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base

# --- Configuration & Setup ---
SECRET_KEY = "a_very_secret_key_that_should_be_changed"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
DATABASE_URL = "sqlite:///./complypilot.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


# --- Database Models ---
class User(Base): __tablename__ = "users"; id = Column(Integer, primary_key=True); email = Column(String, unique=True,
                                                                                                  index=True); hashed_password = Column(
    String)


class Trade(Base): __tablename__ = "trades"; id = Column(Integer, primary_key=True); client_id = Column(String,
                                                                                                        index=True); pan = Column(
    String); symbol = Column(String); volume = Column(Integer); value = Column(Float); status = Column(String,
                                                                                                       default="Open")


class Rule(Base): __tablename__ = "rules"; id = Column(Integer, primary_key=True); name = Column(String,
                                                                                                 index=True); description = Column(
    String); is_active = Column(Boolean, default=True); rule_type = Column(String); threshold = Column(Float)


class Watchlist(Base): __tablename__ = "watchlist"; id = Column(Integer, primary_key=True); client_id = Column(String,
                                                                                                               index=True); reason = Column(
    String); added_by = Column(String); added_on = Column(String, default=lambda: datetime.utcnow().isoformat())


# --- FastAPI App ---
app = FastAPI(title="ComplyPilot API V1.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000", "http://localhost:3001"],
                   allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


# --- Automatic Setup on Startup ---
@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    inspector = inspect(engine)
    if not inspector.has_table("users"):
        print("INFO:     Database not found. Creating all tables...")
        Base.metadata.create_all(bind=engine)
        print("INFO:     Tables created successfully.")

        print("INFO:     Seeding initial data for first-time run...")
        # 1. Create User
        db.add(User(email="admin@complypilot.com", hashed_password=pwd_context.hash("password")))
        # 2. Seed Rules
        active_rules_data = [
            Rule(name="High Value Transaction", description="Flags trades exceeding a specific value.", is_active=True,
                 rule_type="Trade Value", threshold=2500000.0),
            Rule(name="High Volume Stock",
                 description="Flags trades for a specific stock volume in non-blue chip stocks.", is_active=True,
                 rule_type="Trade Volume", threshold=50000.0),
            Rule(name="Penny Stock Manipulation", description="Flags high value trades in known penny stocks.",
                 is_active=True, rule_type="Penny Stock Value", threshold=500000.0),
            Rule(name="Inactive Frequent Trading Rule",
                 description="Flags clients executing many trades in a short period.", is_active=False,
                 rule_type="Frequency", threshold=5.0)
        ]
        db.add_all(active_rules_data)
        # 3. Seed Watchlist
        db.add_all([Watchlist(client_id="CL-0815", reason="Previous history of wash trading.", added_by="System")])

        # 4. Seed Trades AND Proactively Apply Rules
        db.query(Trade).delete()
        mock_trades_data = [
            {"client_id": "CL-1001", "pan": "ABCDE1234F", "symbol": "RELIANCE (NSE)", "volume": 12000,
             "value": 36000000.0, "category": "Blue Chip"},
            {"client_id": "CL-1002", "pan": "FGHIJ5678K", "symbol": "SUZLON (BSE)", "volume": 80000, "value": 4000000.0,
             "category": "Penny Stock"},
            {"client_id": "CL-1003", "pan": "KLMNO9012P", "symbol": "TCS (NSE)", "volume": 400, "value": 1200000.0,
             "category": "Blue Chip"},
            {"client_id": "CL-1004", "pan": "QRSUV3456W", "symbol": "YESBANK (NSE)", "volume": 150000,
             "value": 2250000.0, "category": "Penny Stock"},
            {"client_id": "CL-1005", "pan": "XYZAB7890C", "symbol": "IDEA (NSE)", "volume": 500000, "value": 750000.0,
             "category": "Penny Stock"},
        ]
        trades_to_add = []
        for trade_data in mock_trades_data:
            status = "Normal"
            for rule in active_rules_data:
                if rule.is_active:
                    if rule.rule_type == "Trade Value" and trade_data[
                        "value"] > rule.threshold: status = "Flagged"; break
                    if rule.rule_type == "Trade Volume" and trade_data["category"] != "Blue Chip" and trade_data[
                        "volume"] > rule.threshold: status = "Review"; break
                    if rule.rule_type == "Penny Stock Value" and trade_data["category"] == "Penny Stock" and trade_data[
                        "value"] > rule.threshold: status = "Flagged"; break
            trade_data_copy = trade_data.copy()
            trade_data_copy.pop("category", None)
            trade_data_copy["status"] = status
            trades_to_add.append(Trade(**trade_data_copy))
        db.add_all(trades_to_add)
        db.commit()
        print("INFO:     Initial data has been seeded successfully.")
    else:
        print("INFO:     Database found. Skipping initial data seed.")
    db.close()


# --- Dependencies & Auth Functions ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def verify_password(plain_password, hashed_password): return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password): return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy();
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15));
    to_encode.update({"exp": expire});
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials",
                              headers={"WWW-Authenticate": "Bearer"})
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM]);
        email: str = payload.get("sub")
        if email is None: raise exception
    except JWTError:
        raise exception
    user = db.query(User).filter(User.email == email).first()
    if user is None: raise exception
    return user


# --- API Endpoints ---
@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    token = create_access_token(data={"sub": user.email}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return {"access_token": token, "token_type": "bearer"}


@app.get("/api/alerts")
def get_alerts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)): return db.query(
    Trade).order_by(Trade.id.desc()).all()


@app.get("/api/alerts/summary")
def get_alerts_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total_alerts = db.query(Trade).filter(Trade.status != "Normal").count()
    flagged_count = db.query(Trade).filter(Trade.status == "Flagged").count()
    review_count = db.query(Trade).filter(Trade.status == "Review").count()
    high_risk_clients = db.query(Watchlist.client_id).distinct().count()
    return {"total_alerts": total_alerts, "flagged": flagged_count, "in_review": review_count,
            "high_risk_clients": high_risk_clients}


@app.put("/api/alerts/{trade_id}")
def update_alert_status(trade_id: int, status_data: dict, db: Session = Depends(get_db),
                        current_user: User = Depends(get_current_user)):
    trade = db.query(Trade).filter(Trade.id == trade_id).first();
    if not trade: raise HTTPException(status_code=404, detail="Trade not found")
    trade.status = status_data.get("status", trade.status);
    db.commit();
    return trade


@app.post("/api/analyze")
def analyze_trade(trade: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    active_rules = db.query(Rule).filter(Rule.is_active == True).all()
    knowledge = "\n".join([f"- **{r.name}**: {r.description} (Threshold: ₹{r.threshold:,.0f})" for r in active_rules])

    prompt_template = f"""
As an expert compliance AI named ComplyPilot, your analysis must be professional, direct, and in clean Markdown.
Base your analysis *exclusively* on the active rules provided. Do not invent information.

### Active Rules Context:
{knowledge}

### Trade Alert Details:
- **Client ID:** {trade.get('client_id')}
- **PAN:** {trade.get('pan')}
- **Symbol:** {trade.get('symbol')}
- **Trade Value:** ₹{trade.get('value'):,.0f}
- **Trade Volume:** {trade.get('volume'):,.0f}

---
### **Analysis Report**

#### **1. Violated Rule Identification**
*   **Rule Name:** (State the full name of the single most critical rule that was violated. If none, state "No specific rule violations detected.")
*   **Reason for Flag:** (Explain in one sentence *why* the trade violated this rule, referencing the trade's value/volume and the rule's threshold.)

#### **2. Risk Assessment**
*   **Severity Level:** (Assign a severity: **CRITICAL**, **HIGH**, or **MODERATE**. Base this on the rule type, e.g., High Value is Critical.)
*   **Potential Risk:** (Describe the compliance risk in one sentence, e.g., "Potential for market manipulation or laundering of funds.")

#### **3. Recommended Actions**
1.  (Provide the first clear, immediate, actionable step.)
2.  (Provide a second, follow-up action.)
3.  (Provide a third, documentation-related action.)
"""

    api_payload = {"messages": [{"role": "user", "content": prompt_template}], "temperature": 0.2, "max_tokens": 500}
    try:
        res = requests.post("http://localhost:1234/v1/chat/completions", json=api_payload)
        res.raise_for_status()
        return {"advice": res.json()['choices'][0]['message']['content'].strip()}
    except Exception as e:
        return {
            "advice": f"### Error\nCould not connect to the local AI model. Please ensure LM Studio is running.\n\n**Details:**\n`{str(e)}`"}


@app.get("/api/rules")
def get_rules(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)): return db.query(
    Rule).order_by(Rule.id).all()


@app.post("/api/rules")
def create_rule(rule_data: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_rule = Rule(name=rule_data['name'], description=rule_data['description']);
    db.add(new_rule);
    db.commit();
    return new_rule


@app.put("/api/rules/{rule_id}")
def update_rule(rule_id: int, rule_data: dict, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    rule = db.query(Rule).filter(Rule.id == rule_id).first();
    if not rule: raise HTTPException(status_code=404, detail="Rule not found")
    for k, v in rule_data.items(): setattr(rule, k, v)
    db.commit();
    return rule


@app.delete("/api/rules/{rule_id}")
def delete_rule(rule_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rule = db.query(Rule).filter(Rule.id == rule_id).first();
    if not rule: raise HTTPException(status_code=404, detail="Rule not found")
    db.delete(rule);
    db.commit();
    return {"message": "Rule deleted"}


@app.get("/api/watchlist")
def get_watchlist(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)): return db.query(
    Watchlist).order_by(Watchlist.id.desc()).all()


@app.post("/api/watchlist")
def add_to_watchlist(item_data: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = Watchlist(client_id=item_data['client_id'], reason=item_data['reason'], added_by=current_user.email);
    db.add(item);
    db.commit();
    return item


@app.get("/api/reports")
def get_reports(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return [{"id": 1, "name": "Monthly UCC Submission - Aug 2025", "generated_on": "2025-09-01T10:00:00Z"},
            {"id": 2, "name": "Quarterly High-Value Trades - Q2 2025", "generated_on": "2025-07-15T14:30:00Z"}]