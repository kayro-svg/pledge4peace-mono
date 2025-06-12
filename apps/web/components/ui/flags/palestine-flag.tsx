import * as React from "react";
import { SVGProps } from "react";

interface PalestineFlagProps extends SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
}

const PalestineFlag = ({
  width = 20,
  height = 15,
  ...props
}: PalestineFlagProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 0 60 45"
    fill="none"
    {...props}
  >
    <g clipPath="url(#a)">
      <g fillRule="evenodd" clipPath="url(#b)" clipRule="evenodd">
        <path fill="#000" d="M-11.252 0h90v15.003h-90V0Z" />
        <path fill="#fff" d="M-11.252 15.003h90v14.994h-90V15.003Z" />
        <path fill="#090" d="M-11.252 29.997h90V45h-90V29.997Z" />
        <path fill="red" d="m-11.252 45 45-22.5-45-22.5v45Z" />
      </g>
    </g>
    {/* <rect
      width={59.9}
      height={44.9}
      x={0.05}
      y={0.05}
      stroke="#E5E7EB"
      strokeWidth={0.1}
      rx={5.95}
    /> */}
    <defs>
      <clipPath id="a">
        <rect width={60} height={45} fill="#fff" rx={6} />
      </clipPath>
      <clipPath id="b">
        <path fill="#fff" d="M0 0h60v45H0z" />
      </clipPath>
    </defs>
  </svg>
);
export default PalestineFlag;
