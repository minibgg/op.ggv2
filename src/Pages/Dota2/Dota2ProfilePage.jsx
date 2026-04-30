import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { dotaApi } from "./Components/DotaApi";

export default function ProfilePage() {
  const { accountId } = useParams();

  useEffect(() => {
    async function loadProfile() {
      try {
        const [accountInfo, accoundWL] = await Promise.all([
          dotaApi.getAccountInfo(accountId),
          dotaApi.getWinLose(accountId),
        ]);
        console.log(`информация об аккаунте: ${accountInfo}`);
        console.log(`победы поражения: ${accoundWL}`);
      } catch (error) {
        console.log(`ошибка: ${error}`);
      }
      loadProfile();
    }
    [accountId];
  });
  return <div></div>;
}
