
export interface MenuSectionInterface {
    title: string;
    sections: MenuItemInterface[];
}

export interface MenuItemInterface {
    title: string;
    url?: string;
    icon: string;
    children?: MenuItemChildInterface[];
    isOpen: boolean;
    isDisabled?: boolean;
    role: string[]
}

export interface MenuItemChildInterface {
    title: string;
    icon?: string;
    url: string;
}
