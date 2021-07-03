import { Marks, EditableProps } from "../common/Defines";

export const MyLeaf: NonNullable<EditableProps["renderLeaf"]> = ({
  attributes,
  children,
  leaf,
}) => {
  const style: any = {};
  if (leaf[Marks.BOLD]) style.fontWeight = "bold";
  if (leaf[Marks.ITALIC]) style.fontStyle = "italic";
  if (leaf[Marks.FontSize]) style.fontSize = leaf.fontSize;
  if (leaf[Marks.Underline] || leaf[Marks.LineThrough])
    style.textDecoration = `${leaf[Marks.Underline] ? "underline" : ""} ${
      leaf[Marks.LineThrough] ? "line-through" : ""
    }`;
  if (leaf[Marks.Color]) style.color = leaf[Marks.Color];
  if (leaf[Marks.BGColor]) style.backgroundColor = leaf[Marks.BGColor];

  return (
    <span {...attributes} style={style}>
      {children}
    </span>
  );
};
