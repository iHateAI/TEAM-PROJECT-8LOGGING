import React, { useState } from "react";
import styled, { css } from "styled-components";
import GlobalTheme from "@/styles/theme";
import { curUserState } from "@/recoil/atoms/authState";
import { useRecoilState } from "recoil";
import BaseValidateTextContainer from "@/components/hoc/BaseValidateTextContainer";
import BaseCardContainer from "../hoc/BaseCardContainer";
import Modal from "../modal/Modal";
import { useForm } from "react-hook-form";
import { ErrorType } from "@/types/error/errorType";
import { UserInfoType } from "@/types/auth/authTypes";
import {
  authProfileNickUpdate,
  authProfileDescriptionUpdate,
} from "@/api/authFetcher";
import {
  BigTitle,
  TitleContainer,
  EditButtonWrapper,
  EditButton,
} from "@/styles/commonStyle";
import CustomIcon from "@/components/icons/CustomIcon";

interface ImgProps {
  img?: string;
}

interface UserInfoEditProps {
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  setIsPsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  onModalOpenButtonClickEvent: () => void;
}
const EditInput = css`
  background-color: ${GlobalTheme.colors.lightGray};
  width: 60%;
  border: 1px solid ${GlobalTheme.colors.theme};
  padding: 0.5rem;
  border-radius: 0.5rem;
  &:hover {
    background-color: ${GlobalTheme.colors.lightTwoGray};
  }
`;

function UserInfoEditForm({
  setIsEditing,
  setIsPsEditing,
  onModalOpenButtonClickEvent,
}: UserInfoEditProps) {
  const [curUser, setCurUser] = useRecoilState(curUserState);
  const [erorrMessage, setErorrMessage] = useState("");
  const [isOppenModal, setIsOpenModal] = useState(false);

  const handlerClick = () => {
    setIsEditing(false);
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserInfoType>({ mode: "onChange" });

  const onModalCancelButtonClickEvent = () => {
    setIsOpenModal(false);
  };
  const isValid = !errors.nickname && !errors.description;
  const onvalid = async (data: UserInfoType) => {
    try {
      await authProfileNickUpdate("/api/users/nickname", data.nickname);
      await authProfileDescriptionUpdate(
        "/api/users/description",
        data.description
      );
      setCurUser({
        ...curUser,
        ...data,
      });
      setIsEditing(false);
    } catch (e) {
      const err = e as ErrorType;
      const erorrMessage = err.response.data?.message;
      setErorrMessage(erorrMessage);
      setIsOpenModal(true);
    }
  };

  return (
    <BaseCardContainer width="50vh">
      <TitleContainer>
        <BigTitle>EDIT USER INFORMATION</BigTitle>
      </TitleContainer>
      <Img img={curUser?.profPic} onClick={onModalOpenButtonClickEvent}>
        <UploadButton>
          <CustomIcon
            name="upload"
            size="20"
            color={GlobalTheme.colors.theme}
          />
        </UploadButton>
      </Img>
      <InpurForm onSubmit={handleSubmit(onvalid)}>
        <InputContainer>
          ???????????????
          <UserNickNameIntput
            type="text"
            placeholder="NickName..."
            defaultValue={curUser.nickname}
            {...register("nickname", {
              required: "???????????? ???????????????!",
              minLength: {
                value: 3,
                message: "???????????? ????????? ?????? ???????????????!",
              },
            })}
          />
          {errors.nickname && (
            <BaseValidateTextContainer>
              {errors.nickname.message}
            </BaseValidateTextContainer>
          )}
        </InputContainer>

        <InputContainer>
          ???????????? ??????
          <UserDescriptionInput
            type="text"
            placeholder="Description..."
            defaultValue={curUser.description}
            {...register("description", {
              required: "?????? ????????? ???????????????!",
              minLength: {
                value: 1,
                message: "?????? ????????? ????????? ?????? ???????????????!",
              },
            })}
          />
          {errors.description && (
            <BaseValidateTextContainer>
              {errors.description.message}
            </BaseValidateTextContainer>
          )}
        </InputContainer>
        <EditButtonWrapper>
          <EditButton width="60%" type="submit" disabled={!isValid}>
            CONFIRM
          </EditButton>
          <EditButton width="60%" type="button" onClick={handlerClick}>
            CANCEL
          </EditButton>
        </EditButtonWrapper>
        <EditButton
          width="60%"
          type="button"
          onClick={() => setIsPsEditing(true)}
        >
          ???????????? ????????????
        </EditButton>
      </InpurForm>
      <Modal
        isOpenModal={isOppenModal}
        isAlertModal={true}
        isShowImage={true}
        onModalCancelButtonClickEvent={onModalCancelButtonClickEvent}
      >
        {erorrMessage}
      </Modal>
    </BaseCardContainer>
  );
}

const Img = styled.div<ImgProps>`
  position: relative;
  width: 8rem;
  height: 8rem;
  cursor: pointer;
  background-image: url(${(props) => props.img});
  background-size: cover;
  border-radius: 100%;
  margin-bottom: 2rem;
`;

const UploadButton = styled.span`
  position: absolute;
  bottom: -0.5rem;
  right: 0rem;
`;
const InpurForm = styled.form`
  display: flex;
  width: 100%;
  height: 50%;
  align-items: center;
  justify-content: space-around;
  flex-direction: column;
  font-size: ${GlobalTheme.fontSize.littleBig};
  input {
    ${EditInput}
  }
`;
const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 1rem;
`;
const UserNickNameIntput = styled.input``;

const UserDescriptionInput = styled.input``;

export default UserInfoEditForm;
