import React, { useEffect, useState } from "react";
import _ from "lodash";
import styled from "styled-components";
import SelectBox from "./SelectBox";
import ReactJson from "react-json-view";

const ConverterContainer = styled.div`
  width: 100%;
  height: 100vh;
  padding: 20px 20px 20px 20px;

  display: flex;
  justify-content: center;
  align-items: center;

  background-color: rgba(0, 0, 0, 0.1);
`;

const ConverterWrapper = styled.div`
  padding: 20px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  background-color: white;
  box-shadow: 3px 3px 5px rgba(0, 0, 0, 0.2);
`;

const LanguageMenu = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  list-style: none;

  padding: 4px 0px;
`;

const LanguageTarget = styled.span`
  font-size: 12px;
  line-height: 12px;

  display: block;
  font-weight: 700;
`;

const TextInput = styled.input`
  width: 380px;
  padding: 5px 5px 5px 5px;
  margin-left: 5px;
  outline: 0 none;

  border-color: rgba(0, 0, 0, 0.7);
  border: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);

  color: rgba(0, 0, 0, 0.8);
`;

const DownloadWrap = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const DownloadButton = styled.a`
  margin: 15px 0px 0px 0px;
  padding: 10px;
  font-size: 15px;

  text-decoration: none;

  border-radius: 5px;

  background-color: ${({ disabled }) => (disabled ? "rgba(0, 0, 0, 0.2)" : "rgba(0, 0, 0, 0.9)")};
  color: white;

  cursor: pointer;

  pointer-events: ${({ disabled }) => (disabled ? "none" : "")};

  transition: background-color 0.5s ease;
`;

const JsonView = styled.div`
  width: 487.66px;
  margin-top: 15px;
  max-height: 300px;
  overflow-y: scroll;

  display: block;
`;

const languageData = [
  { name: "Select Language", value: "" },
  { name: "Korean", value: "Korean" },
  { name: "English", value: "English" },
  { name: "Chinese", value: "Chinese" },
  { name: "Deutsch", value: "Deutsch" },
];

const App = () => {
  const API_TOKEN = "AIzaSyBiXVHWac0qqPbeW857yGxkeMr5OZ401kM";
  const [spreadSheetsId, setSpreadSheetsId] = useState("1k5Muc1xM3_PP0musMihHJMEkYYarIVSKKERUriHBkV8");

  const [stringId, setStringId] = useState([]); // STR_ID 등록
  const [jsonUrl, setJsonUrl] = useState(""); // JSON 다운로드 주소 생성
  const [fileName, setFileName] = useState(""); // file 생성 시, JSON 파일 이름 설정
  const [jsonData, setJsonData] = useState(); // ReactJson View에 표시 할 Json

  // SpreacAPI Cell Data
  const SpreadAPI = async (range) => {
    let resJson = [];

    resJson = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadSheetsId}/values/Sheet1!${range}?key=${API_TOKEN}`).then((response) =>
      response.json()
    );

    return resJson.values ? resJson.values : resJson;
  };

  const getGoogleSpreadSheetsStringId = async () => {
    const getData = await SpreadAPI("A2:A9999");
    setStringId(getData);
  };

  const googleSpreadSheetsConnect = async (range) => {
    let language = {};

    const getData = await SpreadAPI(range);

    // 오류 발견 시
    if (getData.error) {
      setJsonData(getData.error);
      return;
    }

    _.forEach(getData, (res, index) => {
      language = { ...language, [stringId[index][0]]: res[0] };
    });

    const charset = "data:application/json;charset=utf-8,";

    let JsonUrl = charset + encodeURIComponent(JSON.stringify(language, null, 2));
    setJsonUrl(JsonUrl);
    setJsonData(language);
  };

  const getLanguage = async (language) => {
    let range = "";
    let fileName = "";

    switch (language) {
      case "Korean":
        range = "B2:B9999";
        fileName = "ko.json";
        break;
      case "English":
        range = "C2:C9999";
        fileName = "en.json";
        break;
      case "Chinese":
        range = "D2:D9999";
        fileName = "zh.json";
        break;
      case "Deutsch":
        range = "E2:E9999";
        fileName = "de.json";
        break;
      default:
        break;
    }

    googleSpreadSheetsConnect(range);
    setFileName(fileName);
  };

  useEffect(() => {
    const getSpreadData = async () => {
      await getGoogleSpreadSheetsStringId();
    };

    getSpreadData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSelect = (e) => {
    const { value } = e.target;

    if (value === "") {
      setJsonData();
      setJsonUrl(value);
      return;
    }

    getLanguage(value);
  };

  const onChange = (e) => {
    const { value } = e.target;

    setSpreadSheetsId(value);
  };

  return (
    <ConverterContainer>
      <ConverterWrapper>
        <LanguageMenu>
          <LanguageTarget>API TOKEN : </LanguageTarget>
          <TextInput value={API_TOKEN} readOnly />
        </LanguageMenu>
        <LanguageMenu>
          <LanguageTarget>SpreadSheets ID : </LanguageTarget>
          <TextInput value={spreadSheetsId} onChange={onChange} />
        </LanguageMenu>
        <LanguageMenu>
          <LanguageTarget>Language Target : </LanguageTarget>
          <SelectBox data={languageData} onSelect={onSelect} />
        </LanguageMenu>
        <JsonView>
          <ReactJson src={jsonData} displayDataTypes={false} iconStyle={"circle"} />
        </JsonView>
        <DownloadWrap>
          <DownloadButton disabled={jsonUrl === ""} href={jsonUrl} id={fileName} download={fileName}>
            DOWNLOAD
          </DownloadButton>
        </DownloadWrap>
      </ConverterWrapper>
    </ConverterContainer>
  );
};

export default App;
