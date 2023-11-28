import { useParams, Navigate } from "react-router-dom";
import { Flex } from "@chakra-ui/react";

import { HOME } from "@goalz/routes";
import Hashtag from "@goalz/components/Hashtag";

export default function TagPage() {
  const { tag } = useParams();

  if (!tag || tag.length === 0) {
    return <Navigate to={HOME} replace />;
  }

  return (
    <Flex
      align="center"
      justify="center"
      w={{
        base: "xs",
        md: "md",
        lg: "lg",
      }}
    >
      <Hashtag tag={tag} />
    </Flex>
  );
}
