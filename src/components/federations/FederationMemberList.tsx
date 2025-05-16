import { useState, useEffect } from "react";
import {
  Card,
  Title,
  Text,
  Group,
  Button,
  Loader,
  SimpleGrid,
  ActionIcon,
  Menu,
  Badge,
  Select,
} from "@mantine/core";
import { Federation, Member } from "@/types";
import { useDataFetching } from "@/hooks/useDataFetching";
import { getMembersByFederationId } from "@/services/memberService";
import { MoreVertical, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

interface FederationMemberListProps {
  federation: Federation | null;
  federationLoading: boolean;
}

export default function FederationMemberList({
  federation,
  federationLoading,
}: FederationMemberListProps) {
  const { t } = useTranslation();
  const {
    data: members,
    loading: membersLoading,
    error: membersError,
  } = useDataFetching<Member[]>({
    fetchFunction: () => getMembersByFederationId(federation?._id ?? ""),
    skip: federationLoading,
  });

  return (
    <SimpleGrid cols={1} spacing="md">
      {members?.map((member) => (
        <Card key={member._id} withBorder p="md">
          <Group position="apart">
            <div>
              <Group>
                <Text weight={500}>{member.name}</Text>
              </Group>

              {member.federation && typeof member.federation !== "string" && (
                <Text size="xs" color="dimmed">
                  {t("clubs.federation")}: {member.federation.name} (
                  {member.federation.abbreviation})
                </Text>
              )}
            </div>
            <Group>
              <Button
                size="xs"
                leftIcon={<Users size={14} />}
                component="a"
                href={`/clubs/${member._id}/athletes`}
              >
                {t("athletes.title")}
              </Button>
              {/* <Menu position="bottom-end">
                <Menu.Target>
                  <ActionIcon>
                    <MoreVertical size={16} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  {onEdit && (
                    <Menu.Item
                      icon={<Edit size={14} />}
                      onClick={() => onEdit(member)}
                    >
                      {t("common.edit")}
                    </Menu.Item>
                  )}
                  {onContact && (
                    <Menu.Item
                      icon={<Mail size={14} />}
                      onClick={() => onContact(member)}
                    >
                      {t("common.contact")}
                    </Menu.Item>
                  )}
                  {onDelete && (
                    <Menu.Item
                      icon={<Trash size={14} />}
                      color="red"
                      onClick={() => onDelete(member)}
                    >
                      {t("common.delete")}
                    </Menu.Item>
                  )}
                </Menu.Dropdown>
              </Menu> */}
            </Group>
          </Group>
        </Card>
      ))}
    </SimpleGrid>
  );
}
