# WindMapLayer

WindMapLayer developed for projection with global wind conditions.

Inspired by "earth"(https://github.com/cambecc/earth), "Wind-JS"(https://github.com/Esri/wind-js) and meaning of purposed is more easier to use with other opensource map api and support standalone server for grabbing NOAA-NOMADS gfs datas.

Map based on Leaflet.js 1.0.1, Google Map API(experimental).
Using Javascript, node.js, express, node-scheduler, async.

This project doubled as a tutorial, to follow subjects with number will be helpful.

----------

WindMapLayer는 지구상 바람의 상태를 맵 위에 시각화하기 위한 프로젝트입니다.

이 프로젝트는 몇몇 오픈 소스, "earth"(https://github.com/cambecc/earth), "Wind-JS"(https://github.com/Esri/wind-js)를 참고하여 만들어졌으며, WindMap을 보다 다양한 맵 API상에서 사용할 수 있도록 하기 위함입니다. 또한 NOAA(미국 기상청)의 기상 정보를 주기적으로 적재하는 기능을 포함하고 있습니다.

Leaflet.js와 Google Map API(시범적으로, 오류 있음)상에서 사용 가능하며,
Javascript, Node.js, express 프레임워크, scheduler 모듈, async 모듈 등이 사용되었습니다.

이 프로젝트는 튜토리얼의 기능도 겸하고 있으니, 번호 순서대로 따라가면 도움이 될 것입니다.

----------

**NOTE: HTML5 canvas, Fetch API 사용으로 IE에서는 동작하지 않습니다.**
