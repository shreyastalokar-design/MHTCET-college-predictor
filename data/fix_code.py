import pandas as pd

df = pd.read_excel(r"C:\Users\Shreyas\OneDrive\mhtcet-predictor\mhtcet-predictor\data\Complete_Database.xlsx", dtype={'Institution Code': str})
df['Institution Code'] = df['Institution Code'].str.strip()
df.to_csv(r"C:\Users\Shreyas\OneDrive\mhtcet-predictor\mhtcet-predictor\data\mhtcet_complete.csv", index=False)

print(f"Done! {len(df)} rows saved.")
print("Sample codes:", df['Institution Code'].head(5).tolist())