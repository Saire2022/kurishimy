import * as React from "react"
import Svg, { Path, LinearGradient, Stop } from "react-native-svg"
/* SVGR has dropped some elements not supported by react-native-svg: style */

export function Logo(props) {
  return (
    <Svg
      id="Capa_1"
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      viewBox="0 0 595.3 750.4"
      xmlSpace="preserve"
      enableBackground="new 0 0 595.3 750.4"
      {...props}
    >
      <Path
        d="M248.2 266.5L297.6 97.2 361.5 266.5 430.2 207.5 430.5 303.7 506.7 303.7 448.9 371.3 588.1 420.9 449.3 491.4 494 558.7 423 558.7 421.7 636.4 361.5 585.3 297.6 744.7 248.2 587 182.7 639.3 182.7 551.6 94.9 549.9 157.2 479 7.1 420.9 146.8 371.3 95.5 299.4 172.3 298.5 172.9 206.8z"
        fill="#f9b233"
      />
      <Path
        d="M230.7 319c17.9-10.8 39-17.1 61.4-17.1h11c65.7 0 119 53.3 119 119s-53.3 119-119 119h-11c-65.7 0-119-53.3-119-119 0-43.2 23.1-81.1 57.6-101.9"
        fillOpacity={0.23}
      />
      <LinearGradient
        id="SVGID_1_"
        gradientUnits="userSpaceOnUse"
        x1={201.3681}
        y1={420.9448}
        x2={393.9119}
        y2={420.9448}
        gradientTransform="matrix(1 0 0 -1 0 841.89)"
      >
        <Stop offset={0} stopColor="#ffef26" />
        <Stop offset={0.0595} stopColor="#ffe000" />
        <Stop offset={0.1303} stopColor="#ffd300" />
        <Stop offset={0.2032} stopColor="#fecb00" />
        <Stop offset={0.2809} stopColor="#fdc800" />
        <Stop offset={0.6685} stopColor="#f18f34" />
        <Stop offset={0.8876} stopColor="#e95f32" />
        <Stop offset={1} stopColor="#e3312d" />
      </LinearGradient>
      <Path
        d="M257.4 350L258 325.6 337.2 326.3 337.5 348.5 367.2 348.8 367.2 388.4 393.9 388.4 393.9 461.1 365.6 461.1 365.6 491.4 333.1 490.7 333.1 516.3 258.2 514.9 258.2 489.7 226.9 489.5 227.2 457.2 201.4 457.2 202 388.4 225.9 388.4 226.6 350.2z"
        fill="url(#SVGID_1_)"
      />
      <LinearGradient
        id="SVGID_00000154407464837321016760000005964339896541306508_"
        gradientUnits="userSpaceOnUse"
        x1={243.1953}
        y1={469.2852}
        x2={350.2553}
        y2={469.2852}
        gradientTransform="matrix(1 0 0 -1 0 841.89)"
      >
        <Stop offset={0} stopColor="#fff" />
        <Stop offset={1} stopColor="#000" />
      </LinearGradient>
      <Path
        d="M243.2 388.5L350.3 388.5 350.3 373.5 330.4 373.5 330 356.7 262.5 356.7 262.5 373.5 243.8 373.5z"
        fill="url(#SVGID_00000154407464837321016760000005964339896541306508_)"
      />
      <LinearGradient
        id="SVGID_00000036245863588780039470000014269982248978202780_"
        gradientUnits="userSpaceOnUse"
        x1={240.24}
        y1={399.3198}
        x2={355.04}
        y2={399.3198}
        gradientTransform="matrix(1 0 0 -1 0 841.89)"
      >
        <Stop offset={0} stopColor="#fff" />
        <Stop offset={1} stopColor="#000" />
      </LinearGradient>
      <Path
        d="M297.6 425.1L335.2 401.6 355 430 296 483.5 240.2 429.9 248.7 418.7 261.5 401.6z"
        fill="url(#SVGID_00000036245863588780039470000014269982248978202780_)"
      />
      <LinearGradient
        id="SVGID_00000140733064342977095260000003522465306956255152_"
        gradientUnits="userSpaceOnUse"
        x1={248.395}
        y1={408.0087}
        x2={346.885}
        y2={408.0087}
        gradientTransform="matrix(1 0 0 -1 0 841.89)"
      >
        <Stop offset={0} stopColor="#ffef26" />
        <Stop offset={0.0595} stopColor="#ffe000" />
        <Stop offset={0.1303} stopColor="#ffd300" />
        <Stop offset={0.2032} stopColor="#fecb00" />
        <Stop offset={0.2809} stopColor="#fdc800" />
        <Stop offset={0.6685} stopColor="#f18f34" />
        <Stop offset={0.8876} stopColor="#e95f32" />
        <Stop offset={1} stopColor="#e3312d" />
      </LinearGradient>
      <Path
        d="M297.4 450.1L343.7 413.6 346.9 418.2 297.4 455.5 248.4 418.2 252.9 412.3z"
        fill="url(#SVGID_00000140733064342977095260000003522465306956255152_)"
      />
    </Svg>
  )
}
