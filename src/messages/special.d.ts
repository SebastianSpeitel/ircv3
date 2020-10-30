

export type ChannelModeFlag = 'o' | 'p' | 's' | 'i' | 't' | 'n' | 'b' | 'v';
export type ChannelMode = `${'+' | '-'}${ChannelModeFlag | `${ChannelModeFlag}${ChannelModeFlag}` | `${ChannelModeFlag}${ChannelModeFlag}${ChannelModeFlag}`}`;

export type UserModeFlag = 'i' | 'w' | 's' | 'o';
export type UserMode = `${'+' | '-'}${UserModeFlag}`;
