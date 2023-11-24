import { useState, type ChangeEvent } from "react";
import { VoidApi } from "@void-cat/api";
import { base64 } from "@scure/base";
import { NDKKind } from "@nostr-dev-kit/ndk";
import { useToast, Stack, Input, Avatar } from "@chakra-ui/react";

import { useSign } from "@ngine/context";
import { unixNow } from "@ngine/time";

const FILE_EXT_REGEX = /\.([\w]{1,7})$/i;
const VOID_CAT_HOST = "https://void.cat";

type UploadResult = {
  url?: string;
  error?: string;
};

interface ImageUploaderProps {
  showPreview?: boolean;
  onImageUpload: (img: string) => void;
  defaultImage?: string;
}

export default function ImageUploader({
  showPreview = true,
  onImageUpload,
  defaultImage,
}: ImageUploaderProps) {
  const sign = useSign();
  const [avatar, setAvatar] = useState<string | undefined>(defaultImage);
  const [isUploading, setIsUploading] = useState(false);
  const toast = useToast();

  async function auth(url: string, method: string) {
    const e = {
      kind: 27235 as NDKKind,
      created_at: unixNow(),
      content: "",
      tags: [
        ["u", url],
        ["method", method],
      ],
    };
    const signed = await sign(e);
    const authEvent = signed.rawEvent();
    const token = base64.encode(
      new TextEncoder().encode(JSON.stringify(authEvent)),
    );
    return `Nostr: ${token}`;
  }

  async function onFileChange(ev: ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files && ev.target.files[0];
    if (file) {
      try {
        setIsUploading(true);
        const upload = await voidCatUpload(file);
        if (upload.url) {
          setAvatar(upload.url);
          onImageUpload(upload.url);
          toast({
            status: "success",
            title: "File uploaded",
            position: "top-right",
            isClosable: true,
            duration: 1500,
          });
        }
        if (upload.error) {
          toast({
            status: "error",
            title: upload.error,
            position: "top-right",
            isClosable: true,
            duration: 1500,
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsUploading(false);
      }
    }
  }

  async function voidCatUpload(file: File): Promise<UploadResult> {
    const voidCatApi = new VoidApi(VOID_CAT_HOST, auth);
    const uploader = voidCatApi.getUploader(file);

    const rsp = await uploader.upload({
      "V-Strip-Metadata": "true",
    });
    if (rsp.ok) {
      let ext = file.name.match(FILE_EXT_REGEX);
      if (rsp.file?.metadata?.mimeType === "image/webp") {
        ext = ["", "webp"];
      }
      const resultUrl =
        rsp.file?.metadata?.url ??
        `${VOID_CAT_HOST}/d/${rsp.file?.id}${ext ? `.${ext[1]}` : ""}`;

      const ret = {
        url: resultUrl,
      } as UploadResult;

      return ret;
    } else {
      return {
        error: rsp.errorMessage,
      };
    }
  }

  return (
    <Stack align="center" gap={4}>
      {showPreview && <Avatar key={avatar} size="xl" src={avatar} />}
      <Input
        isDisabled={isUploading}
        type="file"
        onChange={onFileChange}
        sx={{ padding: 1 }}
      />
    </Stack>
  );
}
