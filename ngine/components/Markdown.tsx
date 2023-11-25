import { Stack, StackProps } from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import Link from "./Link";

interface MarkdownProps extends StackProps {
  content: string;
}

export default function Markdown({ content, ...rest }: MarkdownProps) {
  return (
    <Stack fontSize="sm" {...rest}>
      <ReactMarkdown
        components={{
          a({ children, ...props }) {
            return (
              <Link {...props} isExternal>
                {children}
              </Link>
            );
          },
        }}
        allowedElements={["p", "a"]}
        skipHtml={true}
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </ReactMarkdown>
    </Stack>
  );
}
