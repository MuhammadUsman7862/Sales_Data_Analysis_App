from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import numpy as np
import io
import json
from typing import Optional

app = FastAPI(title="Sales Data Analysis API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

stored_df: Optional[pd.DataFrame] = None


def safe_json(obj):
    if isinstance(obj, (np.integer,)):   return int(obj)
    if isinstance(obj, (np.floating,)):  return float(obj)
    if isinstance(obj, (np.ndarray,)):   return obj.tolist()
    raise TypeError(f"Not serializable: {type(obj)}")


def clean_columns(df):
    df.columns = [str(c).strip().lower().replace(" ", "_") for c in df.columns]
    return df


def ensure_revenue(df):
    if "revenue" in df.columns:
        return df
    aliases = ["total","amount","sales","total_sales","total_price",
               "price","sale_amount","net_sales","gross_sales","income"]
    for alias in aliases:
        if alias in df.columns:
            return df.rename(columns={alias: "revenue"})
    if "quantity" in df.columns and "unit_price" in df.columns:
        df["quantity"]   = pd.to_numeric(df["quantity"],   errors="coerce").fillna(0)
        df["unit_price"] = pd.to_numeric(df["unit_price"], errors="coerce").fillna(0)
        df["revenue"]    = df["quantity"] * df["unit_price"]
        return df
    num_cols = df.select_dtypes(include="number").columns.tolist()
    if num_cols:
        df["revenue"] = pd.to_numeric(df[num_cols[0]], errors="coerce").fillna(0)
        return df
    df["revenue"] = 0
    return df


def ensure_date(df):
    date_aliases = ["date","order_date","sale_date","transaction_date",
                    "purchase_date","created_at","datetime","timestamp"]
    for alias in date_aliases:
        if alias in df.columns:
            if alias != "date":
                df = df.rename(columns={alias: "date"})
            df["date"] = pd.to_datetime(df["date"], errors="coerce")
            df.dropna(subset=["date"], inplace=True)
            return df
    for col in df.columns:
        try:
            parsed = pd.to_datetime(df[col], errors="coerce")
            if parsed.notna().sum() > len(df) * 0.5:
                df["date"] = parsed
                df.dropna(subset=["date"], inplace=True)
                return df
        except Exception:
            continue
    raise ValueError("No date column found. Please include a column named 'date' or 'order_date'.")


def ensure_product(df):
    aliases = ["product","product_name","item","item_name","sku","product_id","goods","description","name"]
    for alias in aliases:
        if alias in df.columns:
            if alias != "product":
                df = df.rename(columns={alias: "product"})
            return df
    df["product"] = "Unknown Product"
    return df


def load_demo_data():
    np.random.seed(42)
    n = 500
    products   = ["Laptop Pro","Wireless Mouse","USB-C Hub","Monitor 4K","Mechanical Keyboard",
                  "Webcam HD","SSD 1TB","Headphones","Desk Lamp","Tablet Stand"]
    categories = {"Laptop Pro":"Computers","Wireless Mouse":"Accessories","USB-C Hub":"Accessories",
                  "Monitor 4K":"Displays","Mechanical Keyboard":"Accessories","Webcam HD":"Peripherals",
                  "SSD 1TB":"Storage","Headphones":"Audio","Desk Lamp":"Office","Tablet Stand":"Office"}
    prices     = {"Laptop Pro":1299,"Wireless Mouse":45,"USB-C Hub":79,"Monitor 4K":649,
                  "Mechanical Keyboard":149,"Webcam HD":89,"SSD 1TB":119,"Headphones":199,
                  "Desk Lamp":35,"Tablet Stand":29}
    regions    = ["North","South","East","West"]
    month_w    = [0.06,0.05,0.07,0.07,0.08,0.08,0.09,0.09,0.09,0.10,0.11,0.11]
    months     = np.random.choice(range(1,13), size=n, p=month_w)
    days       = [np.random.randint(1,28) for _ in range(n)]
    prod_names = np.random.choice(products, size=n, p=[0.20,0.12,0.10,0.12,0.10,0.08,0.08,0.08,0.06,0.06])
    data = {
        "order_id":   [f"ORD-{1000+i}" for i in range(n)],
        "date":       [f"2024-{m:02d}-{d:02d}" for m,d in zip(months,days)],
        "product":    prod_names,
        "category":   [categories[p] for p in prod_names],
        "region":     np.random.choice(regions, size=n),
        "quantity":   np.random.randint(1,6,size=n),
        "unit_price": [prices[p]+np.random.randint(-10,20) for p in prod_names],
    }
    df = pd.DataFrame(data)
    df["date"]    = pd.to_datetime(df["date"])
    df["revenue"] = df["quantity"] * df["unit_price"]
    return df


def analyse(df):
    df = df.copy()
    df = clean_columns(df)
    df = ensure_date(df)
    df = ensure_revenue(df)
    df = ensure_product(df)

    df["month"]      = df["date"].dt.month
    df["month_name"] = df["date"].dt.strftime("%b")
    df["revenue"]    = pd.to_numeric(df["revenue"], errors="coerce").fillna(0)
    qty_col          = df["quantity"] if "quantity" in df.columns else pd.Series([1]*len(df))
    df["quantity"]   = pd.to_numeric(qty_col, errors="coerce").fillna(1)

    total_revenue = float(df["revenue"].sum())
    total_orders  = int(len(df))
    avg_order_val = float(df["revenue"].mean())
    total_units   = int(df["quantity"].sum())

    monthly = (df.groupby(["month","month_name"])["revenue"]
               .sum().reset_index().sort_values("month"))
    monthly_trend = [{"month":r["month_name"],"revenue":round(float(r["revenue"]),2)}
                     for _,r in monthly.iterrows()]

    top_products = (df.groupby("product")
                    .agg(revenue=("revenue","sum"), units=("quantity","sum"), orders=("product","count"))
                    .reset_index().sort_values("revenue",ascending=False).head(10))
    products_list = [{"product":r["product"],"revenue":round(float(r["revenue"]),2),
                      "units":int(r["units"]),"orders":int(r["orders"])}
                     for _,r in top_products.iterrows()]

    category_data = []
    if "category" in df.columns:
        cat = df.groupby("category")["revenue"].sum().reset_index().sort_values("revenue",ascending=False)
        category_data = [{"category":r["category"],"revenue":round(float(r["revenue"]),2)} for _,r in cat.iterrows()]

    region_data = []
    if "region" in df.columns:
        reg = df.groupby("region")["revenue"].sum().reset_index().sort_values("revenue",ascending=False)
        region_data = [{"region":r["region"],"revenue":round(float(r["revenue"]),2)} for _,r in reg.iterrows()]

    quality = {
        "total_rows":  len(df),
        "null_values": int(df.isnull().sum().sum()),
        "duplicates":  int(df.duplicated().sum()),
        "date_range":  {"start":str(df["date"].min().date()),"end":str(df["date"].max().date())},
    }

    sample_df = df.head(8).copy()
    sample_df["date"] = sample_df["date"].dt.strftime("%Y-%m-%d")
    sample = []
    for rec in sample_df.to_dict("records"):
        safe_rec = {}
        for k,v in rec.items():
            if isinstance(v,(np.integer,)):   safe_rec[k] = int(v)
            elif isinstance(v,(np.floating,)): safe_rec[k] = float(v)
            else:
                try:
                    safe_rec[k] = None if pd.isna(v) else v
                except Exception:
                    safe_rec[k] = str(v)
        sample.append(safe_rec)

    return {
        "kpis":               {"total_revenue":total_revenue,"total_orders":total_orders,
                               "avg_order_value":avg_order_val,"total_units":total_units},
        "monthly_trend":      monthly_trend,
        "top_products":       products_list,
        "category_breakdown": category_data,
        "region_breakdown":   region_data,
        "data_quality":       quality,
        "columns":            list(df.columns),
        "sample":             sample,
    }


@app.get("/")
def root():
    return {"message": "Sales Data Analysis API is running OK"}

@app.get("/api/demo")
def get_demo():
    global stored_df
    stored_df = load_demo_data()
    result = analyse(stored_df)
    return JSONResponse(content=json.loads(json.dumps(result, default=safe_json)))

@app.post("/api/upload")
async def upload_csv(file: UploadFile = File(...)):
    global stored_df
    fname = (file.filename or "").lower()
    if not (fname.endswith(".csv") or fname.endswith(".xlsx") or fname.endswith(".xls")):
        raise HTTPException(status_code=400, detail="Unsupported file. Please upload .csv or .xlsx")

    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")

    try:
        if fname.endswith(".csv"):
            df = None
            for enc in ["utf-8","utf-8-sig","latin-1","cp1252"]:
                try:
                    df = pd.read_csv(io.BytesIO(contents), encoding=enc)
                    break
                except UnicodeDecodeError:
                    continue
            if df is None:
                raise ValueError("Could not decode CSV. Try saving the file as UTF-8.")
        else:
            df = pd.read_excel(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not parse file: {str(e)}")

    if df.empty:
        raise HTTPException(status_code=400, detail="File has no data rows.")
    if len(df.columns) < 2:
        raise HTTPException(status_code=400, detail="File must have at least 2 columns.")

    try:
        stored_df = df
        result = analyse(df)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")

    return JSONResponse(content=json.loads(json.dumps(result, default=safe_json)))

@app.get("/api/analysis")
def get_analysis():
    if stored_df is None:
        raise HTTPException(status_code=404, detail="No data loaded yet.")
    result = analyse(stored_df)
    return JSONResponse(content=json.loads(json.dumps(result, default=safe_json)))

