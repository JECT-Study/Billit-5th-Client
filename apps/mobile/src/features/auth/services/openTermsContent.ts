import * as WebBrowser from 'expo-web-browser';

// https 주소만 연다. 약관 주소가 아직 비어 있거나 임시값이면 false.
export function isTermsContentUrl(url: string) {
  return /^https:\/\/\S+$/.test(url.trim());
}

// 약관 본문(Notion 게시 페이지)을 앱 안 브라우저로 연다.
// 화면 안에 직접 그리는 WebView로 바꿀 때는 이 함수만 교체한다.
export async function openTermsContent(url: string) {
  await WebBrowser.openBrowserAsync(url.trim(), {
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
  });
}
