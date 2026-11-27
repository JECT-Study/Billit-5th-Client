import Svg, { Defs, FeGaussianBlur, Filter, Path } from 'react-native-svg';

// Figma 2260:19819(Star 2). .svg 파일로 불러오면 SVGR이 filter 태그를 지워 블러가 빠지므로
// react-native-svg 컴포넌트로 직접 그린다.
const WIDTH = 276.589;
const HEIGHT = 290;
const RAYS_PATH =
  'M138.295 8L142.952 130.668L218.821 34.1647L150.487 136.142L268.589 102.665L153.365 145L268.589 187.335L150.487 153.858L218.821 255.835L142.952 159.332L138.295 282L133.638 159.332L57.7682 255.835L126.103 153.858L8 187.335L123.225 145L8 102.665L126.103 136.142L57.7682 34.1647L133.638 130.668L138.295 8Z';

export function TripCreatedRays() {
  return (
    <Svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
      <Defs>
        <Filter
          id="trip-created-rays-blur"
          x="0"
          y="0"
          width={WIDTH}
          height={HEIGHT}
          filterUnits="userSpaceOnUse"
        >
          <FeGaussianBlur stdDeviation={4} />
        </Filter>
      </Defs>
      <Path
        d={RAYS_PATH}
        fill="white"
        fillOpacity={0.8}
        filter="url(#trip-created-rays-blur)"
      />
    </Svg>
  );
}
