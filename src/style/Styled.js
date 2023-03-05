import styled from "styled-components";

export const ConverterContainer = styled.div`
  width: 100%;
  height: 100%;

  position: relative;

  display: flex;
  justify-content: center;
  align-items: center;

  background-color: rgba(0, 0, 0, 0.1);
`;

export const ConvertMainWrapper = styled.div`
  width: 100%;
  height: 100%;

  /* border-radius: 10px;
  box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset; */

  overflow: hidden;
`;

export const ConverterWrapper = styled.div`
  width: 100%;
  height: 531px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;

  background-color: white;
`;

export const ConverterTitleWrap = styled.div`
  padding: 20px;

  display: flex;
  justify-content: space-between;
  align-items: center;

  background-color: rgba(0, 0, 0, 0.8);
`;

export const ConverterBottomWrap = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: black;
`;

export const ConverterTitle = styled.h1`
  font-size: 15px;
  color: white;
`;

export const LanguageMenu = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  list-style: none;

  padding: 4px 0px;
`;

export const LanguageRequired = styled.span`
  font-size: 14px;
  margin-right: 2px;

  color: rgb(165, 0, 52);
`;

export const LanguageTarget = styled.span`
  width: 30px;
  font-size: 11px;
  line-height: 12px;

  display: block;
  font-weight: 700;
`;

export const DownloadButton = styled.a`
  width: ${({ disabled }) => (disabled ? "0%" : "50%")};
  height: ${({ disabled }) => (disabled ? "0px" : "40px")};

  line-height: 40px;

  text-align: center;
  font-size: 12px;

  text-decoration: none;

  color: white;

  cursor: pointer;

  background-color: rgba(0, 0, 0, 0.8);

  opacity: ${({ disabled }) => (disabled ? "0" : "1")};
  pointer-events: ${({ disabled }) => (disabled ? "none" : "")};

  &:hover {
    background-color: #a50034;
    color: white;
  }

  transition: background-color 0.5s ease, color 0.5s ease;
`;

export const AllDownloadButton = styled.a`
  width: ${({ active }) => (active ? "100%" : "50%")};
  height: ${({ disabled }) => (disabled ? "0px" : "40px")};

  line-height: 40px;

  text-align: center;
  font-size: 12px;

  text-decoration: none;

  color: white;

  cursor: pointer;

  background-color: rgba(0, 0, 0, 0.8);

  pointer-events: ${({ disabled }) => (disabled ? "none" : "")};

  &:hover {
    background-color: #a50034;
    color: white;
  }

  transition: background-color 0.5s ease, color 0.5s ease, width 0.5s ease, height 0.5s ease;
`;

export const JsonView = styled.div`
  /* width: 550px; */
  width: 100%;
  margin-top: 15px;
  max-height: 300px;
  overflow-y: scroll;

  padding: 10px;

  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 5px;

  &::-webkit-scrollbar {
    width: 5px;
    height: 5px;
    background-color: transparent;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 3px;
    background-color: rgba(0, 0, 0, 0.1);

    &:hover {
      background-color: rgba(0, 0, 0, 0.5);
    }
  }
`;

export const UploadFileInput = styled.input`
  /* width: 510px; */
  padding: 8px 5px 8px 5px;
  margin-left: 10px;
  display: none;
`;

export const UploadFileInputStyle = styled.label`
  /* width: 510px; */
  width: 100%;
  font-size: 12px;
  margin-left: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const UploadFileInputText = styled.span`
  width: 92%;
  font-size: 12px;
  padding: 8px 5px 8px 5px;

  border-bottom: ${({ required }) => (required ? "1px solid rgba(165, 0, 52, 0.3)" : "1px solid rgba(0, 0, 0, 0.1)")};

  &:hover {
    border-color: rgba(0, 0, 0, 0.5);
  }

  &:focus {
    border-color: rgba(0, 0, 0, 0.5);
  }

  transition: border-color 0.5s ease;
`;

export const UploadFileInputButton = styled.button`
  padding: 7px 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;

  &:hover {
    background-color: #a50034;
    color: white;
  }

  transition: background-color 0.5s ease;
`;

export const UploadModeWrap = styled.div`
  /* width: 510px; */
  width: 100%;
  margin-left: 10px;

  display: flex;
  justify-content: flex-start;
`;

export const UploadModeButton = styled.button`
  padding: 6px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  color: white;
  margin-right: 2px;
  background-color: ${({ active }) => (active ? "#a50034" : "rgba(0, 0, 0, 0.8)")};

  &:hover {
    background-color: #a50034;
    color: white;
  }

  transition: background-color 0.5s ease;

  cursor: pointer;
`;
