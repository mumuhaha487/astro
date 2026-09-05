import { handleVisitorRequest } from "../../src/edgeone/visitors";

export default function onRequest(context: { request: Request }) {
  return handleVisitorRequest(context.request);
}

