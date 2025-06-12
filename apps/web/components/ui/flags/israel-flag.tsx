import * as React from "react";
import { SVGProps } from "react";

interface IsraelFlagProps extends SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
}

const IsraelFlag = ({ width = 20, height = 15, ...props }: IsraelFlagProps) => (
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
        <path fill="#fff" d="M62.282 45.12H-2.173V0H62.28v45.12Z" />
        <path
          fill="#0038B8"
          d="M62.282 10.152H-2.173V4.23H62.28v5.922Zm0 30.888H-2.173v-5.922H62.28v5.922ZM19.717 16.805 29.42 33.69l9.914-16.805-19.617-.07v-.01Z"
        />
        <path
          fill="#fff"
          d="m27.596 28.006 1.841 3.128 1.886-3.11-3.736-.018h.009Z"
        />
        <path
          fill="#0038B8"
          d="m19.682 28.253 9.711-16.885 9.905 16.814-19.616.07Z"
        />
        <path
          fill="#fff"
          d="m27.596 16.885 1.841-3.129 1.886 3.12-3.736.009h.009Zm-3.86 7.006-1.913 3.172 3.613-.009-1.7-3.172v.009Zm-1.877-5.86 3.63.026-1.745 3.199-1.885-3.226Zm13.324 5.904 1.842 3.128-3.675-.044 1.833-3.084Zm1.807-5.905-3.631.027 1.745 3.199 1.886-3.226Zm-10.073 0-2.503 4.53 2.538 4.433 4.653.105 2.82-4.538-2.608-4.582-4.9.043v.01Z"
        />
      </g>
    </g>
    <rect
      width={59.9}
      height={44.9}
      x={0.05}
      y={0.05}
      stroke="#a2aab8"
      strokeWidth={0.1}
      rx={5.95}
    />
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
export default IsraelFlag;
