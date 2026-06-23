import React, { useState } from "react";
import Page from "../../../shared/ui/Page";
import UserCard from "../components/UserCard";
import Recommendetion from "../components/Recommendetion";
import { useSelector } from "react-redux";
import useMediaQuery from "../../../shared/hooks/useMediaQuery";
import ProfileEditFormModal from "../components/ProfileEditFormModal";
import BannerEditModal from "../components/BannerEditModal";

const Profile = () => {
  const user = useSelector((state) => state.auth.user);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingBanner, setIsEditingBanner] = useState(false);

  console.log(user);

  return (
    <Page className="relative flex justify-between px-0 py-0 md:py-8 text-card-content overflow-y-auto md:overflow-hidden">
      {!isEditing && !isEditingBanner && (
        <UserCard
          user={user}
          setIsEditing={setIsEditing}
          setIsEditingBanner={setIsEditingBanner}
        />
      )}
      {!isEditing && !isEditingBanner && isDesktop && <Recommendetion />}
      {isEditing && (
        <ProfileEditFormModal setIsEditing={setIsEditing} user={user} />
      )}
      {isEditingBanner && (
        <BannerEditModal setIsEditingBanner={setIsEditingBanner} user={user} />
      )}
    </Page>
  );
};

export default Profile;
