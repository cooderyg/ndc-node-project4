const signupValidation = ({ password, nickname }) => {
  // 닉네임 유효성 검증 3글자이상 영문과 숫자만 가능
  const nicknameCheck = /^[a-zA-Z0-9]+$/;
  if (nicknameCheck.test(nickname) || nickname.length < 3) {
    return false;
  }
  // 비번에 닉네임이 포함되어 있으면 에러 반환
  if (password.includes(nickname) || password.length < 4) {
    return false;
  }
  return true;
};

module.exports = signupValidation;
