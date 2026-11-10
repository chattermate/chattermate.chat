-- Launch email: everyone in an org with a live trial that existed before the
-- launch. A live trial keeps out comped orgs; Free (legacy) keeps out orgs that
-- signed up after it, which are on Free and never saw the old prices. Former
-- payers get the win-back instead.
SELECT coalesce(json_agg(row_to_json(t)), '[]')
FROM (
  SELECT u.id AS user_id, u.email, u.full_name, o.id AS org_id, o.name AS org_name,
         to_char(trial.trial_end AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS trial_end,
         EXISTS (
           SELECT 1 FROM enterprise.subscriptions s
           JOIN enterprise.plans p ON p.id = s.plan_id
           WHERE s.organization_id = o.id AND s.status = 'active' AND p.name = 'Free (legacy)'
         ) AS legacy_free,
         o.timezone AS org_timezone
  FROM users u
  JOIN organizations o ON o.id = u.organization_id
  JOIN LATERAL (
    SELECT s.trial_end FROM enterprise.subscriptions s
    WHERE s.organization_id = o.id AND s.status = 'trial' AND s.trial_end > now()
    ORDER BY s.trial_end DESC LIMIT 1
  ) trial ON true
  LEFT JOIN enterprise.email_preferences ep ON ep.user_id = u.id
  WHERE u.is_active AND o.is_active AND u.email IS NOT NULL
    AND ep.lifecycle_opt_out_at IS NULL
    AND EXISTS (
      SELECT 1 FROM enterprise.subscriptions s
      JOIN enterprise.plans p ON p.id = s.plan_id
      WHERE s.organization_id = o.id AND s.status = 'active' AND p.name = 'Free (legacy)'
    )
    AND NOT EXISTS (
      SELECT 1 FROM enterprise.subscriptions s
      JOIN enterprise.plans p ON p.id = s.plan_id
      WHERE s.organization_id = o.id AND s.status = 'cancelled'
        AND s.payment_provider = 'paypal' AND p.type <> 'free'
    )
  ORDER BY o.name, u.created_at
) t;
