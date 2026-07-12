import { createRoot } from "react-dom/client";
import ChatWidget from "./ChatWidget";

export function mountChat(container: HTMLElement) {
    createRoot(container).render(<ChatWidget initialOpen />);
}
