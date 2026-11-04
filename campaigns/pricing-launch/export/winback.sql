-- Win-back: the first user of each org whose paid PayPal plan was cancelled.
-- Run after the hand-set 30-day trials exist. old_price is the row's unit_price:
-- check it is what they really paid before sending.
SELECT coalesce(json_agg(row_to_json(t)), '[]')
FROM (
  SELECT DISTINCT ON (o.id)
         u.id AS user_id, u.email, u.full_name, o.id AS org_id, o.name AS org_name,
         paid.plan_name AS old_plan, paid.unit_price AS old_price,
         to_char(trial.trial_end AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS trial_end,
         (SELECT count(*) FROM knowledge k WHERE k.organization_id = o.id) AS knowledge_sources
  FROM organizations o
  JOIN LATERAL (
    SELECT p.name AS plan_name, s.unit_price
    FROM enterprise.subscriptions s
    JOIN enterprise.plans p ON p.id = s.plan_id
    WHERE s.organization_id = o.id AND s.status = 'cancelled'
      AND s.payment_provider = 'paypal' AND p.type <> 'free'
    ORDER BY s.cancelled_at DESC NULLS LAST LIMIT 1
  ) paid ON true
  JOIN users u ON u.organization_id = o.id
  LEFT JOIN LATERAL (
    SELECT s.trial_end FROM enterprise.subscriptions s
    WHERE s.organization_id = o.id AND s.status = 'trial' AND s.trial_end > now()
    ORDER BY s.trial_end DESC LIMIT 1
  ) trial ON true
  LEFT JOIN enterprise.email_preferences ep ON ep.user_id = u.id
  WHERE u.is_active AND o.is_active AND u.email IS NOT NULL
    AND ep.lifecycle_opt_out_at IS NULL
  ORDER BY o.id, u.created_at
) t;
