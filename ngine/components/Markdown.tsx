import { useCallback, ReactNode } from "react";
import { Stack, StackProps, Image } from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import Link from "./Link";

// eslint-disable-next-line no-useless-escape
const FileExtensionRegex = /\.([\w]+)$/i;

interface HyperTextProps {
  link: string;
  children: ReactNode;
}

export function HyperText({ link, children, ...rest }: HyperTextProps) {
  const render = useCallback(() => {
    try {
      const url = new URL(link);
      const extension =
        FileExtensionRegex.test(url.pathname.toLowerCase()) && RegExp.$1;
      if (extension) {
        switch (extension) {
          case "gif":
          case "jpg":
          case "jpeg":
          case "png":
          case "bmp":
          case "webp": {
            return (
              <Image
                src={url.toString()}
                alt={url.toString()}
                maxH="420px"
                width="100%"
                my={4}
                objectFit="contain"
              />
            );
          }
          case "wav":
          case "mp3":
          case "ogg": {
            return <audio key={url.toString()} src={url.toString()} controls />;
          }
          case "mp4":
          case "mov":
          case "mkv":
          case "avi":
          case "m4v":
          case "webm": {
            return <video key={url.toString()} src={url.toString()} controls />;
          }
          default:
            return (
              <Link {...rest} href={url.toString()}>
                {children || url.toString()}
              </Link>
            );
        }
      } else {
        return (
          <Link {...rest} href={link}>
            {children || link}
          </Link>
        );
      }
    } catch (error) {
      return (
        <Link {...rest} href={link}>
          {children || link}
        </Link>
      );
    }
  }, [link, children]);

  return render();
}

interface MarkdownProps extends StackProps {
  content: string;
}

export default function Markdown({ content, ...rest }: MarkdownProps) {
  return (
    <Stack {...rest}>
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
