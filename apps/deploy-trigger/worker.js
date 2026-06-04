export default {
  async scheduled(event, env, ctx) {
    const response = await fetch(env.DEPLOY_HOOK_URL, { method: 'POST' });
    if (!response.ok) {
      throw new Error(`Deploy hook failed: ${response.status} ${response.statusText}`);
    }
  },
};
