import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CreatedGlowSvg from '@/assets/images/trip/created-glow.svg';
import CreatedRaysSvg from '@/assets/images/trip/created-rays.svg';

// Figma 2260:19811 기준 위치. 세로는 상태바 아래부터, 가로는 화면 가운데부터 잰다.
// SVG는 블러가 퍼질 여백까지 포함한 크기라 노드 좌표보다 조금 바깥에서 시작한다.
const GLOW_TOP = 144;
const GLOW_OFFSET_FROM_CENTER = -303.5;
const RAYS_TOP = 92;
const RAYS_OFFSET_FROM_CENTER = -79.8;

/** 여행방 생성 완료 화면 뒤에 깔리는 원형 빛과 별빛 장식. 화면 전체를 채우는 부모의 첫 자식으로 둔다. */
export function TripCreatedDecoration() {
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View
        style={[
          styles.layer,
          {
            top: insets.top + GLOW_TOP,
            marginLeft: GLOW_OFFSET_FROM_CENTER,
          },
        ]}
      >
        <CreatedGlowSvg />
      </View>
      <View
        style={[
          styles.layer,
          {
            top: insets.top + RAYS_TOP,
            marginLeft: RAYS_OFFSET_FROM_CENTER,
          },
        ]}
      >
        <CreatedRaysSvg />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', left: '50%' },
});
