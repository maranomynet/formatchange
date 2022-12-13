import { FormatMonitorGroupConfig } from "../formatchange";

export type GroupConfig<Group extends string> = Record<
  string,
  { group?: Group | Array<Group>; [x: string]: unknown }
>;

/**
 * Esoteric helper that maps a complex `GroupConfig` config object
 * into a `FormatMonitorGroupConfig`
 */
export const makeGroups = <Group extends string>(
  groupConfig: GroupConfig<Group>
): FormatMonitorGroupConfig<Group> => {
  const mediaGroups = {} as Record<Group, Record<string, boolean>>;
  Object.entries(groupConfig).forEach(([format, formatConfig]) => {
    const grp = formatConfig.group;
    if (grp) {
      const groups = Array.isArray(grp) ? grp : [grp];
      groups.forEach((group) => {
        const grpCfg: Record<string, boolean> = mediaGroups[group] || {};
        mediaGroups[group] = grpCfg;
        grpCfg[format] = true;
      });
    }
  });
  return mediaGroups;
};
