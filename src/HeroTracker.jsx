import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { riotApi } from './riotApi';

export default function HeroTracker() {

try{
  const version = riotApi.getVersion()
  console.log(version)
  const champ = riotApi.getChampions(version)
  console.log(champ)
} catch(error){}
}