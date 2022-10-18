import React, { useMemo } from "react";
import {
  TitleContainer,
  AboutTitle,
  AboutTitleContent,
  TitleHighlight,
  AboutImage,
  TextOne,
  TextTwo,
  BoldStyle,
} from "@/styles/commonAboutStyle";
import BarChart from "@/components/chart/BarChart";
import MultiLineChart from "@/components/chart/MultiLineChart";
import { ChartDataType } from "@/types/chart/chartDataType";

export function createAboutFirstConent() {
  return (
    <React.Fragment>
      <TitleContainer itemProp="start">
        <AboutTitle>
          What is “<TitleHighlight>Plogging</TitleHighlight>”?
        </AboutTitle>
        <AboutTitleContent>
          <TextOne>
            플로깅Plogging이란 조깅을 하면서 길가의 쓰레기를 수거하는,
            <br />
            체육활동과 자연보호활동이 합쳐진 활동입니다.
          </TextOne>
          <TextTwo itemProp="left">
            2016년에 스웨덴에서 시작된 이 활동은, 2019년에 2백만 명의 사람들이
            <br />
            매일 플로깅에 참여하는 것으로 집계될 만큼 인기를 끌고 있습니다.
          </TextTwo>
        </AboutTitleContent>
      </TitleContainer>
      <AboutImage src="/images/plogging-about-1.png" />
    </React.Fragment>
  );
}

export function createAboutSecondContent({ labels, data }: ChartDataType) {
  return (
    <TitleContainer itemProp="center">
      <AboutTitle>
        Why <TitleHighlight>Plog</TitleHighlight>?
      </AboutTitle>
      <AboutTitleContent>
        <TextOne>
          쓰레기가 휴지통이 아닌 바닥에 버려지는
          <br />
          대표적인 장소 중 하나는 바닷가입니다.
        </TextOne>
        <BarChart
          dataName="연도별 쓰레기 무게 합산"
          labels={labels}
          datas={data}
        />
        <TextTwo itemProp="center">
          해양 환경 공단의 해양쓰레기 모니터링 자료에 따르면,
          <br />
          <BoldStyle>전국 60곳에서 발견된 해양쓰레기</BoldStyle>의 합산이
          <BoldStyle>최근 5년간 매년 1톤이 넘었습니다.</BoldStyle>
          <br />
          코로나로 인한 집합 금지가 된 2020년에 그 수치가 감소하였다가,
          <br />
          집합금지가 단계적으로 해제되며 다시 상승세를 보이고 있습니다.
          <br />
          <BoldStyle>
            이많은 쓰레기들이 그대로 바다로 흘러간다면 어떻게 될까요?
          </BoldStyle>
        </TextTwo>
      </AboutTitleContent>
    </TitleContainer>
  );
}

export function createAboutThirdContent({
  labels,
  data1,
  data2,
  data3,
}: ChartDataType) {
  const multiDatas = useMemo(
    () => [data1, data2, data3] as number[][],
    [data1, data2, data3]
  );

  return (
    <TitleContainer itemProp="center">
      <AboutTitleContent>
        <TextOne>
          다음은 2050년 까지의 해양 미세 플라스틱의 무게를
          <br />
          배출 속도에 비례하여 시각화 한 자료입니다.
        </TextOne>
        <MultiLineChart
          dataName="플라스틱 배출"
          labels={labels}
          multiDatas={multiDatas}
        />
        <TextTwo itemProp="center">
          해양으로 흘러 들어간 쓰레기는
          <BoldStyle>해양 생물이 먹을수도 있으며,</BoldStyle>
          <br />
          플라스틱 쓰레기의 경우엔
          <BoldStyle>수 있습니다.</BoldStyle>
          광분해 된 미세플라스틱은 해양생물 체내에 축적되며,
          <br />
          이는 곧 해양 생물을 섭취하는 인체에 악영향으로 이어집니다.
          <br />
          <BoldStyle>
            해양으로의 플라스틱 배출 속도가 유지되거나 증가한다면,
          </BoldStyle>
          <br />
          해양미세플라스틱의 무게는
          <br />
          기하 급수적으로 상승
          <BoldStyle>할 것으로예상됩니다.</BoldStyle>
          배출되는 플라스틱을 줄이는 건 환경과 인류 모두를 위해 필요한
          노력입니다.
          <br />
        </TextTwo>
      </AboutTitleContent>
    </TitleContainer>
  );
}

export function createAboutFourthContent() {
  return (
    <TitleContainer itemProp="center">
      <AboutTitleContent>
        <AboutTitle>
          Let’s go<TitleHighlight> 8logging!</TitleHighlight>
        </AboutTitle>
        <TextOne>
          저희 서비스를 통해 주변에 같이 플로깅할 인원들을 찾아 활동도 하고
          추억을 쌓아보세요!
        </TextOne>
        <TextTwo itemProp="center">
          쓰레기 자연 분해 시간은 쓰레기가 토양에 쌓여 완전히 소멸되기까지
          걸리는 시간입니다.
          <br />
          재활용될 수 있는 플라스틱, 유리병은 5백년, 백만년 가까운 시간이 지나야
          자연 분해가 됩니다.
          <br />
          플로깅을 통해 이런 쓰레기들을 제대로 수거하면, 환경도 보호하고
          쓰레기를 재활용될 수 있게 됩니다.
        </TextTwo>
      </AboutTitleContent>
    </TitleContainer>
  );
}
