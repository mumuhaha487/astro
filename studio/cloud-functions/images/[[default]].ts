import { handleEdgeOneRequest } from "../../src/edgeone/handler";

export default function onRequest(context: Parameters<typeof handleEdgeOneRequest>[0]) {
  return handleEdgeOneRequest(context);
}
