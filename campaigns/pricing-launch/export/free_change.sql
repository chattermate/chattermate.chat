-- Free plan change: everyone in an org whose ruling plan is still Free (legacy).
-- last_month_replies is the previous calendar month, counted the way the meter
-- counts bot replies. Free orgs have no Ask AI or investigations to add.
SELECT coalesce(json_agg(row_to_json(t)), '[]')
FROM (
  SELECT u.id AS user_id, u.email, u.full_name, o.id AS org_id, o.name AS org_name,
         o.timezone AS org_timezone,
         (SELECT count(*) FROM chat_history c
          WHERE c.organization_id = o.id AND c.message_type = 'bot'
            AND coalesce(c.attributes ->> 'source', '') NOT IN ('app', 'host', 'journey')
            AND c.created_at >= date_trunc('month', now()) - interval '1 month'
            AND c.created_at < date_trunc('month', now())) AS last_month_replies,
         EXISTS (SELECT 1 FROM channel_accounts a
                 WHERE a.organization_id = o.id AND a.is_active) AS has_channels
  FROM users u
  JOIN organizations o ON o.id = u.organization_id
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
      WHERE s.organization_id = o.id AND p.type <> 'free'
        AND (s.status IN ('active', 'past_due') OR (s.status = 'trial' AND s.trial_end > now()))
    )
  ORDER BY o.name, u.created_at
) t;
