# আমার টাকা হিসাব — PWA

GitHub/Render-এ deploy করার জন্য প্রস্তুত একটি lightweight Bengali PWA.

## বর্তমান ফিচার
- Opening cash (default ৳500,000)
- ধার দেওয়া
- ফেরত পাওয়া
- নগদ জমা
- খরচ
- ব্যক্তিভিত্তিক বাকি
- Dashboard totals
- Transaction history
- Search
- JSON backup/restore
- CSV export
- Android PWA install
- Local offline storage

## Supabase cloud sync
এই starter-এ local-first storage রাখা হয়েছে। Cloud sync চালু করতে Supabase project তৈরি করে authentication + transactions table যোগ করা যাবে।

প্রস্তাবিত table:
`transactions(id uuid primary key, user_id uuid, name text, type text, amount numeric, date date, note text, created_at timestamptz default now())`
`profiles(user_id uuid primary key, opening_cash numeric default 0)`

RLS অবশ্যই user_id ভিত্তিক করতে হবে।
