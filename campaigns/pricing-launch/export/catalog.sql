-- Monthly plan rows, as catalog.json. Run after plan_catalog_0002 is on prod.
SELECT json_build_object('plans', json_object_agg(name, json_build_object(
         'usd', (razorpay_plans -> 'USD' ->> 'price_per_agent')::numeric,
         'inr', (razorpay_plans -> 'INR' ->> 'price_per_agent')::numeric,
         'max_messages', max_messages,
         'trial_days', trial_days,
         'features', features)))
FROM enterprise.plans
WHERE organization_id IS NULL
  AND billing_interval = 'monthly'
  AND name IN ('Free', 'Free (legacy)', 'Starter', 'Growth', 'Pro');
