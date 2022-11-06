import Html from "/app/web/html";
import { hydrateRoot } from "react-dom/client";
import walk from "./walk";

const content = walk(location.pathname.split("/"));

hydrateRoot(document, <Html>{content}</Html>);
