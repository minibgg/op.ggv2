import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { dotaApi } from "./Components/DotaApi";

export default function ProfilePage() {
  const { accountId } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const [accountInfo, accoundWL] = await Promise.all([
          dotaApi.getAccountInfo(accountId),
          dotaApi.getWinLose(accountId),
        ]);
        setData({
          accountInfo,
          accoundWL,
        });
      } catch (error) {
        console.log(`ошибка: ${error}`);
      }
    }
    loadProfile();
  }, [accountId]);

  if (!data) {
    return <div>Loading Profile Info</div>;
  }

  console.log(data.accountInfo);
  console.log(data.accoundWL);

  return <div>{data.accountInfo.profile.personaname}</div>;
}
