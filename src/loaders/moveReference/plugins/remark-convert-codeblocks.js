import { visit } from "unist-util-visit";

/**
 * A Remark plugin that:
 * - Converts <pre><code>...</code></pre> HTML blocks into proper fenced code blocks.
 * - Removes extra HTML markup inside <code> blocks (e.g., <b>, <a>, etc.).
 * - Wraps content with ```move fenced code blocks.
 */
export default function remarkConvertCodeBlocks() {
  return (tree) => {
    // Convert HTML code blocks
    visit(tree, "html", (node, index, parent) => {
      const match = node.value.match(/<pre><code>([\s\S]*?)<\/code><\/pre>/);
      if (match) {
        // First trim the content to check if it's empty
        let codeContent = match[1].trim();

        // If the code block is empty, remove it by returning null
        if (!codeContent) {
          parent.children.splice(index, 1);
          return;
        }

        codeContent = codeContent
          // Remove <b>, <strong>, <i> while keeping their content
          .replace(/<\/?(b|strong|i)>/g, "")
          // Remove <a> tags but keep the text inside
          .replace(/<a [^>]*>(.*?)<\/a>/g, "$1")
          // Remove any other residual HTML tags
          .replace(/<\/?[^>]+(>|$)/g, "")
          // Decode HTML entities
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .trim();

        // Replace the HTML node with a fenced code block node
        parent.children[index] = {
          type: "code",
          lang: "move",
          value: codeContent,
        };
      }
    });

    // Add 'move' language to existing fenced code blocks that don't have a language specified
    visit(tree, "code", (node) => {
      if (!node.lang) {
        node.lang = "move";
      }
    });
  };
}
