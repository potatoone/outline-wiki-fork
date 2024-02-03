import { observer } from "mobx-react";
import { MoreIcon, QuestionMarkIcon, UserIcon } from "outline-icons";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components";
import { CollectionPermission } from "@shared/types";
import type Collection from "~/models/Collection";
import type Document from "~/models/Document";
import Flex from "~/components/Flex";
import Text from "~/components/Text";
import useCurrentUser from "~/hooks/useCurrentUser";
import useRequest from "~/hooks/useRequest";
import useStores from "~/hooks/useStores";
import Avatar from "../Avatar";
import { AvatarSize } from "../Avatar/Avatar";
import CollectionIcon from "../Icons/CollectionIcon";
import Squircle from "../Squircle";
import Tooltip from "../Tooltip";
import { StyledListItem } from "./MemberListItem";

export const OtherAccess = observer(
  ({
    document,
    children,
  }: {
    document: Document;
    children: React.ReactNode;
  }) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const collection = document.collection;
    const usersInCollection = useUsersInCollection(collection);
    const user = useCurrentUser();

    return (
      <>
        {collection ? (
          <>
            {collection.permission ? (
              <StyledListItem
                image={
                  <Squircle color={theme.accent} size={AvatarSize.Medium}>
                    <UserIcon color={theme.accentText} size={16} />
                  </Squircle>
                }
                title={t("All members")}
                subtitle={t("Everyone in the workspace")}
                actions={
                  <AccessTooltip>
                    {collection?.permission === CollectionPermission.ReadWrite
                      ? t("Can edit")
                      : t("Can view")}
                  </AccessTooltip>
                }
              />
            ) : usersInCollection ? (
              <StyledListItem
                image={
                  <Squircle color={collection.color} size={AvatarSize.Medium}>
                    <CollectionIcon
                      collection={collection}
                      color={theme.white}
                      size={16}
                    />
                  </Squircle>
                }
                title={collection.name}
                subtitle={t("Everyone in the collection")}
                actions={<AccessTooltip>{t("Can view")}</AccessTooltip>}
              />
            ) : (
              <StyledListItem
                image={<Avatar model={user} showBorder={false} />}
                title={user.name}
                subtitle={t("You have full access")}
                actions={<AccessTooltip>{t("Can edit")}</AccessTooltip>}
              />
            )}
            {children}
          </>
        ) : document.isDraft ? (
          <>
            <StyledListItem
              image={<Avatar model={document.createdBy} showBorder={false} />}
              title={document.createdBy.name}
              actions={
                <AccessTooltip tooltip={t("Created the document")}>
                  {t("Can edit")}
                </AccessTooltip>
              }
            />
            {children}
          </>
        ) : (
          <>
            {children}
            <StyledListItem
              image={
                <Squircle color={theme.accent} size={AvatarSize.Medium}>
                  <MoreIcon color={theme.accentText} size={16} />
                </Squircle>
              }
              title={t("Other people")}
              subtitle={t("Other workspace members may have access")}
              actions={
                <AccessTooltip
                  tooltip={t(
                    "This document may be shared with more workspace members through a parent document or collection you do not have access to"
                  )}
                />
              }
            />
          </>
        )}
      </>
    );
  }
);

const AccessTooltip = ({
  children,
  tooltip,
}: {
  children?: React.ReactNode;
  tooltip?: string;
}) => {
  const { t } = useTranslation();

  return (
    <Flex align="center" gap={2}>
      <Text type="secondary" size="small">
        {children}
      </Text>
      <Tooltip tooltip={tooltip ?? t("Access inherited from collection")}>
        <QuestionMarkIcon size={18} />
      </Tooltip>
    </Flex>
  );
};

function useUsersInCollection(collection?: Collection) {
  const { users, memberships } = useStores();
  const { request } = useRequest(() =>
    memberships.fetchPage({ limit: 1, id: collection!.id })
  );

  React.useEffect(() => {
    if (collection && !collection.permission) {
      void request();
    }
  }, [collection]);

  return collection
    ? collection.permission
      ? true
      : users.inCollection(collection.id).length > 1
    : false;
}