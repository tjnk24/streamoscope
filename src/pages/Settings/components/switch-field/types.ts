interface OwnProps {
    label: string;
    hint?: string;
    checked: boolean;
    onChange: (isChecked: boolean) => void;
}

export type Props = OwnProps;
