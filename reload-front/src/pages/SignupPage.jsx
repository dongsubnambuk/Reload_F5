import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import Modal from "react-modal";
import DaumPostcode from "react-daum-postcode";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    userID: "",
    email: "",
    password: "",
    confirmPassword: "",
    userName: "",
    phoneNumber: "",
    zipCode: "",
    roadAddress: "",
    detailAddress: "",
  });
  
  const [verificationCode, setVerificationCode] = useState("");
  const [inputVerificationCode, setInputVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    if (id === "confirmPassword" || id === "password") {
      validatePasswords(
        id === "password" ? value : formData.password,
        id === "confirmPassword" ? value : formData.confirmPassword
      );
    }
  };

  const validatePasswords = (password, confirmPassword) => {
    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
    } else {
      setError("");
    }
  };

  const sendVerificationCode = () => {
    if (!formData.phoneNumber) {
      setError("연락처를 입력해주세요.");
      return;
    }
    const generatedCode = Math.floor(1000 + Math.random() * 9000);
    setVerificationCode(generatedCode.toString());
    setIsCodeSent(true);
    setError("");
  };

  const verifyCode = () => {
    if (verificationCode === inputVerificationCode) {
      setError("");
      alert("인증이 완료되었습니다.");
    } else {
      setError("인증번호가 일치하지 않습니다.");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch("http://3.37.122.192:8000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.userID,
          password: formData.password,
          name: formData.userName,
          postalCode: formData.zipCode,
          roadNameAddress: formData.roadAddress,
          detailedAddress: formData.detailAddress,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("회원가입이 완료되었습니다.");
        navigate("/");
      } else {
        setError(result.message || "회원가입에 실패했습니다.");
      }
    } catch (err) {
      setError("서버 연결에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const completeHandler = (data) => {
    setFormData(prev => ({
      ...prev,
      zipCode: data.zonecode,
      roadAddress: data.roadAddress,
    }));
    setIsOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">회원가입</CardTitle>
            <CardDescription className="text-center">
              서비스 이용을 위한 회원가입을 진행해주세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form onSubmit={handleSignup}>
              <div className="space-y-4">
                {/* 아이디 입력 */}
                <FormField>
                  <FormItem>
                    <FormLabel>아이디</FormLabel>
                    <FormControl>
                      <Input
                        id="userID"
                        placeholder="아이디를 입력해주세요"
                        value={formData.userID}
                        onChange={handleInputChange}
                      />
                    </FormControl>
                  </FormItem>
                </FormField>

                {/* 비밀번호 입력 */}
                <FormField>
                  <FormItem>
                    <FormLabel>비밀번호</FormLabel>
                    <FormControl>
                      <Input
                        id="password"
                        type="password"
                        placeholder="비밀번호를 입력해주세요"
                        value={formData.password}
                        onChange={handleInputChange}
                      />
                    </FormControl>
                  </FormItem>
                </FormField>

                {/* 비밀번호 확인 */}
                <FormField>
                  <FormItem>
                    <FormLabel>비밀번호 확인</FormLabel>
                    <FormControl>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="비밀번호를 다시 입력해주세요"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                      />
                    </FormControl>
                  </FormItem>
                </FormField>

                {/* 이름 입력 */}
                <FormField>
                  <FormItem>
                    <FormLabel>이름</FormLabel>
                    <FormControl>
                      <Input
                        id="userName"
                        placeholder="이름을 입력해주세요"
                        value={formData.userName}
                        onChange={handleInputChange}
                      />
                    </FormControl>
                  </FormItem>
                </FormField>

                {/* 이메일 입력 */}
                <FormField>
                  <FormItem>
                    <FormLabel>이메일</FormLabel>
                    <FormControl>
                      <Input
                        id="email"
                        type="email"
                        placeholder="이메일을 입력해주세요"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </FormControl>
                  </FormItem>
                </FormField>

                {/* 전화번호 입력 */}
                <FormField>
                  <FormItem>
                    <FormLabel>전화번호</FormLabel>
                    <div className="flex space-x-2">
                      <Input
                        id="phoneNumber"
                        placeholder="전화번호를 입력해주세요"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                      />
                      <Button
                        type="button"
                        onClick={sendVerificationCode}
                        className="w-32"
                      >
                        인증번호 발송
                      </Button>
                    </div>
                  </FormItem>
                </FormField>

                {/* 인증번호 확인 */}
                {isCodeSent && (
                  <FormField>
                    <FormItem>
                      <div className="flex space-x-2">
                        <Input
                          placeholder="인증번호를 입력해주세요"
                          value={inputVerificationCode}
                          onChange={(e) => setInputVerificationCode(e.target.value)}
                        />
                        <Button
                          type="button"
                          onClick={verifyCode}
                          className="w-32"
                        >
                          확인
                        </Button>
                      </div>
                    </FormItem>
                  </FormField>
                )}

                {/* 주소 입력 */}
                <FormField>
                  <FormItem>
                    <FormLabel>주소</FormLabel>
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <Input
                          value={formData.zipCode}
                          placeholder="우편번호"
                          readOnly
                        />
                        <Button
                          type="button"
                          onClick={() => setIsOpen(true)}
                          className="w-32"
                        >
                          주소 찾기
                        </Button>
                      </div>
                      <Input
                        value={formData.roadAddress}
                        placeholder="도로명 주소"
                        readOnly
                      />
                      <Input
                        id="detailAddress"
                        value={formData.detailAddress}
                        placeholder="상세주소를 입력해주세요"
                        onChange={handleInputChange}
                      />
                    </div>
                  </FormItem>
                </FormField>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      처리중...
                    </>
                  ) : (
                    "회원가입"
                  )}
                </Button>
              </div>
            </Form>
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1000,
          },
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            width: "100%",
            maxWidth: "600px",
            height: "600px",
            padding: "20px",
          },
        }}
      >
        <div className="h-full">
          <DaumPostcode onComplete={completeHandler} />
        </div>
      </Modal>
    </div>
  );
};

export default SignupPage;