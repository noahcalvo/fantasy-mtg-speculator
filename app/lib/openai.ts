import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  project: "proj_p85kHnuH3l24yYtLPpEFBVoJ", // from your error headers
  // organization: "org_xxx", // optional; match your dashboard if set
});
