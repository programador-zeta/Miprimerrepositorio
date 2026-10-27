-- Run only in your private Supabase SQL Editor as the project owner.
-- This returns a secret: save it privately and do not share the result in chat or screenshots.
-- No result means SW0001 existed before Vault provisioning; use its original code.
select decrypted_secret as activation_code
from vault.decrypted_secrets
where name = 'somewhere_tag_SW0001_activation';
