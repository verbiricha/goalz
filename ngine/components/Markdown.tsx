import { useMemo, useCallback, ReactNode } from "react";
import { Stack, StackProps, Image, LinkProps } from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { nip19 } from "nostr-tools";

import Link from "./Link";
import Username from "./Username";
import NEvent from "./NEvent";
import { Fragment, Components } from "@ngine/types";

// eslint-disable-next-line no-useless-escape
const FileExtensionRegex = /\.([\w]+)$/i;

interface HyperTextProps extends LinkProps {
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

const NostrPrefixRegex = /^nostr:/;

function extractNprofiles(fragments: Fragment[]): Fragment[] {
  return fragments
    .map((f) => {
      if (typeof f === "string") {
        return f.split(/(nostr:nprofile1[a-z0-9]+)/g).map((i) => {
          if (i.startsWith("nostr:nprofile1")) {
            try {
              const nprofile = i.replace(NostrPrefixRegex, "");
              const decoded = nip19.decode(nprofile);
              if (decoded.type === "nprofile") {
                const { pubkey } = decoded.data;
                return (
                  <Link href={`/p/${nprofile}`}>
                    <Username as="span" pubkey={pubkey} />;
                  </Link>
                );
              }
              return null;
            } catch (error) {
              return i;
            }
          } else {
            return i;
          }
        });
      }
      return f;
    })
    .flat();
}

function extractNpubs(fragments: Fragment[]): Fragment[] {
  return fragments
    .map((f) => {
      if (typeof f === "string") {
        return f.split(/(nostr:npub1[a-z0-9]+)/g).map((i) => {
          if (i.startsWith("nostr:npub1")) {
            try {
              const raw = i.replace(NostrPrefixRegex, "");

              const decoded = nip19.decode(raw);
              if (decoded.type === "npub") {
                return (
                  <Link href={`/p/${raw}`}>
                    <Username as="span" pubkey={decoded.data as string} />
                  </Link>
                );
              }
              return null;
            } catch (error) {
              return i;
            }
          } else {
            return i;
          }
        });
      }
      return f;
    })
    .flat();
}

function extractNevents(fragments: Fragment[], components: Components) {
  return fragments
    .map((f) => {
      if (typeof f === "string") {
        return f.split(/(nostr:nevent1[a-z0-9]+)/g).map((i) => {
          if (i.startsWith("nostr:nevent1")) {
            try {
              const nevent = i.replace(NostrPrefixRegex, "");
              const decoded = nip19.decode(nevent);
              if (decoded.type === "nevent") {
                const { id, relays } = decoded.data;
                return (
                  <NEvent
                    key={nevent}
                    id={id}
                    relays={relays || []}
                    components={components}
                  />
                );
              }
              return null;
            } catch (error) {
              return i;
            }
          } else {
            return i;
          }
        });
      }
      return f;
    })
    .flat();
}

function transformText(
  fragments: Fragment[],
  components: Components,
): Fragment[] {
  let result = extractNprofiles(fragments);
  result = extractNpubs(result);
  result = extractNevents(result, components);
  //fragments = extractNaddrs(fragments);
  //fragments = extractNoteIds(fragments);

  return result;
}

interface MarkdownProps extends StackProps {
  content: string;
  components?: Components;
}

export default function Markdown({
  content,
  components,
  ...rest
}: MarkdownProps) {
  const markdownComponents = useMemo(() => {
    return {
      p({ children }: { children: string }) {
        return (
          <p>{transformText([children], components ?? ({} as Components))}</p>
        );
      },
      a({ href, children, ...props }: { href: string; children: string }) {
        return (
          <HyperText link={href || ""} {...props} isExternal>
            {children}
          </HyperText>
        );
      },
    };
  }, [components]);
  return (
    <Stack {...rest}>
      <ReactMarkdown
        // @ts-ignore
        components={markdownComponents}
        allowedElements={["p", "a"]}
        skipHtml={true}
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </ReactMarkdown>
    </Stack>
  );
}
