import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sparkles, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import CampaignDirectory from './components/CampaignDirectory.jsx'
import DmDashboard from './components/DmDashboard.jsx'
import { APPLICATIONS_STORAGE_KEY, CAMPAIGNS_STORAGE_KEY, createId, initialCampaigns, readDemoStorage, saveDemoStorage } from './data/demoData.js'

gsap.registerPlugin(ScrollTrigger)

const ASSETS = './models/'
const clamp01 = (n) => Math.max(0, Math.min(1, n))
const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}

function Asset({ name, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, onClick }) {
  const { scene } = useGLTF(`${ASSETS}${name}.glb`)
  const clone = useMemo(() => scene.clone(true), [scene])
  return <primitive object={clone} position={position} rotation={rotation} scale={scale} onClick={onClick} />
}

function StoneArch({ z = 0.1 }) {
  const blocks = []
  // Kenney's one-metre stone blocks are repeated to form a readable gatehouse silhouette.
  for (const x of [-2.35, 2.35]) {
    for (let y = 0.5; y < 3.5; y += 1) blocks.push({ pos: [x, y, z], scale: 1 })
    blocks.push({ pos: [x + (x < 0 ? 0.48 : -0.48), 3.25, z], scale: 0.72 })
    blocks.push({ pos: [x + (x < 0 ? 0.52 : -0.52), 4.1, z], scale: 0.72 })
    blocks.push({ pos: [x, 4.3, z], scale: 0.72 })
  }
  // Stepped arch crown over the door opening.
  for (let i = 0; i < 7; i++) {
    const x = -1.5 + i * 0.5
    const archY = 2.9 + Math.sin((i / 6) * Math.PI) * 0.62
    blocks.push({ pos: [x, archY, z], scale: 0.52 })
  }
  return <group>{blocks.map((block, i) => <Asset key={i} name="wall-block" position={block.pos} scale={block.scale} />)}</group>
}

function GateDoors({ progress }) {
  const left = useRef()
  const right = useRef()
  useFrame(() => {
    const open = smooth(0.015, 0.24, progress) * 1.18
    if (left.current) left.current.rotation.y = open
    if (right.current) right.current.rotation.y = -open
  })
  const Door = ({ side }) => (
    <group position={[side * 0.03, 1.33, 0.0]}>
      <mesh castShadow position={[side * 0.52, 0, 0]}>
        <boxGeometry args={[1.06, 2.66, 0.15]} />
        <meshStandardMaterial color="#513522" roughness={0.86} />
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} castShadow position={[side * (0.13 + i * 0.155), 0, 0.09]}>
          <boxGeometry args={[0.035, 2.45, 0.025]} />
          <meshStandardMaterial color={i % 2 ? '#855a30' : '#674426'} roughness={0.8} />
        </mesh>
      ))}
      {[-0.88, 0, 0.88].map((y) => (
        <mesh key={y} castShadow position={[side * 0.52, y, 0.12]}>
          <boxGeometry args={[1.03, 0.07, 0.05]} />
          <meshStandardMaterial color="#9b7a45" metalness={0.62} roughness={0.38} />
        </mesh>
      ))}
      <mesh castShadow position={[side * 0.52, 0, 0.14]}>
        <boxGeometry args={[0.1, 0.1, 0.08]} />
        <meshStandardMaterial color="#d0a85e" metalness={0.75} roughness={0.28} />
      </mesh>
    </group>
  )
  return (
    <group>
      <group ref={left} position={[-1.15, 0, 0.09]}><Door side={1} /></group>
      <group ref={right} position={[1.15, 0, 0.09]}><Door side={-1} /></group>
    </group>
  )
}

function Guard({ position, facing = 0, accent = '#9b4937', phase = 0 }) {
  const root = useRef()
  const swordArm = useRef()
  const sword = useRef()
  const offArm = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 2.4 + phase
    if (root.current) {
      root.current.position.y = position[1] + Math.sin(t * 0.8) * 0.035
      root.current.rotation.z = Math.sin(t * 0.55) * 0.035
    }
    const clash = Math.sin(t * 1.45)
    if (swordArm.current) swordArm.current.rotation.z = -0.2 + clash * 0.54
    if (sword.current) sword.current.rotation.z = -0.2 - clash * 0.28
    if (offArm.current) offArm.current.rotation.z = 0.18 - clash * 0.22
  })
  return (
    <group ref={root} position={position} rotation={[0, facing, 0]}>
      {/* Stylized placeholder guards; replaceable with rigged GLB characters. */}
      <mesh castShadow position={[0, 1.18, 0]}><capsuleGeometry args={[0.31, 0.64, 4, 8]} /><meshStandardMaterial color={accent} roughness={0.75} /></mesh>
      <mesh castShadow position={[0, 1.08, 0.025]}><boxGeometry args={[0.7, 0.22, 0.42]} /><meshStandardMaterial color="#6f706e" metalness={0.45} roughness={0.38} /></mesh>
      <mesh castShadow position={[0, 1.78, 0]}><sphereGeometry args={[0.28, 9, 7]} /><meshStandardMaterial color="#b1a48b" metalness={0.6} roughness={0.33} /></mesh>
      <mesh castShadow position={[0, 1.95, 0.015]}><coneGeometry args={[0.34, 0.28, 7]} /><meshStandardMaterial color="#777b7a" metalness={0.55} roughness={0.35} /></mesh>
      <mesh position={[0, 1.76, 0.245]}><boxGeometry args={[0.23, 0.04, 0.035]} /><meshStandardMaterial color="#201e1a" metalness={0.25} /></mesh>
      <mesh castShadow position={[-0.12, 0.56, 0]}><capsuleGeometry args={[0.12, 0.45, 3, 6]} /><meshStandardMaterial color="#4b4c50" metalness={0.3} roughness={0.5} /></mesh>
      <mesh castShadow position={[0.12, 0.56, 0]}><capsuleGeometry args={[0.12, 0.45, 3, 6]} /><meshStandardMaterial color="#4b4c50" metalness={0.3} roughness={0.5} /></mesh>
      <group ref={swordArm} position={[0.37, 1.42, 0.04]}>
        <mesh castShadow position={[0.16, -0.05, 0]} rotation={[0, 0, -0.35]}><capsuleGeometry args={[0.09, 0.32, 3, 6]} /><meshStandardMaterial color="#9b9b9a" metalness={0.4} /></mesh>
        <group ref={sword} position={[0.33, -0.14, 0.05]} rotation={[0, 0, -0.38]}>
          <mesh castShadow position={[0, 0.43, 0]}><boxGeometry args={[0.055, 0.84, 0.035]} /><meshStandardMaterial color="#d8d9d2" metalness={0.82} roughness={0.22} /></mesh>
          <mesh position={[0, 0.02, 0]}><boxGeometry args={[0.24, 0.06, 0.08]} /><meshStandardMaterial color="#c29c4f" metalness={0.75} /></mesh>
          <mesh position={[0, -0.12, 0]}><cylinderGeometry args={[0.045, 0.045, 0.23, 6]} /><meshStandardMaterial color="#4d3221" /></mesh>
        </group>
      </group>
      <group ref={offArm} position={[-0.37, 1.39, 0.02]}>
        <mesh castShadow position={[-0.14, -0.17, 0]} rotation={[0, 0, 0.45]}><capsuleGeometry args={[0.09, 0.36, 3, 6]} /><meshStandardMaterial color="#9b9b9a" metalness={0.4} /></mesh>
        <mesh castShadow position={[-0.24, -0.37, 0.12]}><sphereGeometry args={[0.13, 7, 5]} /><meshStandardMaterial color="#777b7a" metalness={0.45} /></mesh>
      </group>
      <mesh position={[0, 0.9, 0.2]}><boxGeometry args={[0.43, 0.11, 0.06]} /><meshStandardMaterial color="#b89657" metalness={0.55} /></mesh>
    </group>
  )
}

function Critter({ type = 'leaf', position }) {
  const root = useRef()
  useFrame(({ clock }) => {
    if (!root.current) return
    const t = clock.elapsedTime
    root.current.position.y = position[1] + Math.sin(t * 2.4 + position[0]) * 0.06
    root.current.rotation.y = Math.sin(t * 0.8 + position[0]) * 0.18
  })
  const leaf = type === 'leaf'
  const fire = type === 'ember'
  return (
    <group ref={root} position={position}>
      <mesh castShadow position={[0, 0.42, 0]} scale={[0.62, 0.5, 0.48]}><sphereGeometry args={[0.52, 10, 8]} /><meshStandardMaterial color={leaf ? '#7da76a' : fire ? '#c87a47' : '#dbbf58'} roughness={0.8} /></mesh>
      <mesh castShadow position={[0, 0.82, 0.01]}><sphereGeometry args={[0.28, 9, 7]} /><meshStandardMaterial color={leaf ? '#9fc98a' : fire ? '#dd9c5e' : '#e9d77e'} roughness={0.75} /></mesh>
      {leaf ? <group>
        <mesh castShadow position={[-0.09, 1.19, 0]} rotation={[0, 0, 0.48]}><coneGeometry args={[0.16, 0.42, 5]} /><meshStandardMaterial color="#548b4d" /></mesh>
        <mesh castShadow position={[0.12, 1.18, 0]} rotation={[0, 0, -0.4]}><coneGeometry args={[0.15, 0.38, 5]} /><meshStandardMaterial color="#73a65e" /></mesh>
      </group> : fire ? <mesh castShadow position={[0, 1.23, -0.02]}><coneGeometry args={[0.19, 0.39, 5]} /><meshStandardMaterial color="#e4a34e" emissive="#8d3510" emissiveIntensity={0.25} /></mesh> : <group>
        <mesh castShadow position={[-0.22, 1.08, 0]} rotation={[0, 0, 0.2]}><coneGeometry args={[0.13, 0.3, 5]} /><meshStandardMaterial color="#d8c04f" /></mesh>
        <mesh castShadow position={[0.22, 1.08, 0]} rotation={[0, 0, -0.2]}><coneGeometry args={[0.13, 0.3, 5]} /><meshStandardMaterial color="#d8c04f" /></mesh>
      </group>}
      {[-0.105, 0.105].map((x) => <mesh key={x} position={[x, 0.83, 0.25]}><sphereGeometry args={[0.037, 6, 5]} /><meshBasicMaterial color="#24231d" /></mesh>)}
      <mesh position={[0, 0.62, 0.28]}><sphereGeometry args={[0.035, 6, 5]} /><meshBasicMaterial color="#34251c" /></mesh>
      <mesh castShadow position={[-0.24, 0.12, 0.02]}><sphereGeometry args={[0.14, 7, 5]} /><meshStandardMaterial color={leaf ? '#608e52' : fire ? '#a95b39' : '#c5a83e'} /></mesh>
      <mesh castShadow position={[0.24, 0.12, 0.02]}><sphereGeometry args={[0.14, 7, 5]} /><meshStandardMaterial color={leaf ? '#608e52' : fire ? '#a95b39' : '#c5a83e'} /></mesh>
    </group>
  )
}

function NoticeBoard() {
  return (
    <group position={[0, 2.15, -18.3]}>
      <mesh castShadow position={[0, 0, 0]}><boxGeometry args={[4.6, 3.2, 0.25]} /><meshStandardMaterial color="#54351f" roughness={0.82} /></mesh>
      <mesh position={[0, 0, 0.15]}><boxGeometry args={[4.24, 2.82, 0.05]} /><meshStandardMaterial color="#b28a57" roughness={0.98} /></mesh>
      {[-2.12, 2.12].map((x) => <mesh key={x} castShadow position={[x, 0, 0.22]}><boxGeometry args={[0.14, 3.02, 0.1]} /><meshStandardMaterial color="#6e4828" roughness={0.85} /></mesh>)}
      {[-1.38, -0.46, 0.46, 1.38].map((x, i) => <group key={x} position={[x, i % 2 ? 0.04 : -0.06, 0.22]} rotation={[0, 0, (i % 2 ? -1 : 1) * 0.035]}>
        <mesh castShadow><boxGeometry args={[0.77, 1.3, 0.035]} /><meshStandardMaterial color={['#e4cf9e', '#d9c08c', '#ead6a8', '#d5ba83'][i]} roughness={1} /></mesh>
        {[-0.34, -0.15, 0.04, 0.23].map((y, j) => <mesh key={y} position={[0, y, 0.023]}><boxGeometry args={[0.46 - j * 0.055, 0.018, 0.008]} /><meshBasicMaterial color="#806544" transparent opacity={0.5} /></mesh>)}
        <mesh position={[0.23, 0.5, 0.035]}><circleGeometry args={[0.045, 8]} /><meshStandardMaterial color="#9d3f2a" metalness={0.18} roughness={0.6} /></mesh>
      </group>)}
      {[-2.25, 2.25].map((x) => <mesh key={x} castShadow position={[x, -2.05, 0.02]}><cylinderGeometry args={[0.075, 0.11, 2.4, 6]} /><meshStandardMaterial color="#53351f" /></mesh>)}
      <mesh position={[0, 1.83, 0.23]}><boxGeometry args={[3.7, 0.36, 0.08]} /><meshStandardMaterial color="#3c2a1c" roughness={0.85} /></mesh>
    </group>
  )
}

function World({ progress }) {
  const cameraTarget = useRef(new THREE.Vector3())
  const leftDoorProgress = progress
  const { camera } = useThree()
  useFrame(() => {
    const p = progress
    let cz, cy, tx, ty, tz
    if (p < 0.24) {
      const t = smooth(0, 0.24, p)
      cz = THREE.MathUtils.lerp(10.8, 1.25, t)
      cy = THREE.MathUtils.lerp(3.4, 2.8, t)
      tx = 0; ty = 2.2; tz = -4.7
    } else if (p < 0.5) {
      const t = smooth(0.24, 0.5, p)
      cz = THREE.MathUtils.lerp(1.25, -5.3, t)
      cy = THREE.MathUtils.lerp(2.8, 2.6, t)
      tx = THREE.MathUtils.lerp(0, 0.15, t); ty = 2.2; tz = -10.5
    } else if (p < 0.73) {
      const t = smooth(0.5, 0.73, p)
      cz = THREE.MathUtils.lerp(-5.3, -11.2, t)
      cy = THREE.MathUtils.lerp(2.6, 2.3, t)
      tx = THREE.MathUtils.lerp(0.15, -0.35, t); ty = 1.8; tz = -15.1
    } else {
      const t = smooth(0.73, 1, p)
      cz = THREE.MathUtils.lerp(-11.2, -14.9, t)
      cy = THREE.MathUtils.lerp(2.3, 2.55, t)
      tx = THREE.MathUtils.lerp(-0.35, 0, t); ty = 2.3; tz = -18.4
    }
    const desiredPos = new THREE.Vector3(tx * 0.6, cy, cz)
    camera.position.lerp(desiredPos, 0.075)
    cameraTarget.current.lerp(new THREE.Vector3(tx, ty, tz), 0.08)
    camera.lookAt(cameraTarget.current)
  })
  return (
    <>
      <color attach="background" args={['#101817']} />
      <fog attach="fog" args={['#17211e', 12, 37]} />
      <ambientLight intensity={0.68} color="#d9d5bf" />
      <hemisphereLight intensity={0.8} color="#c4d4e2" groundColor="#352b1d" />
      <directionalLight castShadow position={[5, 10, 7]} intensity={2.1} color="#ffd7a0" shadow-mapSize={[1024, 1024]} />
      <pointLight position={[0, 3.6, 1.4]} intensity={18 * (1 - smooth(0.1, 0.34, progress))} distance={12} color="#f39e47" />
      <pointLight position={[-2.5, 2, -6]} intensity={2} distance={7} color="#f5a65a" />

      {/* Ground and the worn road running through the whole scroll narrative */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, -7]}>
        <planeGeometry args={[50, 55]} /><meshStandardMaterial color="#29362c" roughness={1} />
      </mesh>
      {Array.from({ length: 27 }).map((_, i) => <Asset key={`road-${i}`} name="road" position={[0, -0.04, 7 - i * 1]} scale={1.25} />)}
      {Array.from({ length: 8 }).map((_, i) => <Asset key={`road-side-${i}`} name="road" position={[i % 2 ? -1.1 : 1.1, -0.035, -2.5 - i * 1.2]} rotation={[0, Math.PI / 2, 0]} scale={0.5} />)}

      {/* Gatehouse assembled from the user's uploaded Kenney GLB assets */}
      <StoneArch />
      {[-3.0, 3.0].map((x) => <group key={x}>
        <Asset name="roof-high-gable" position={[x, 3.65, 0.1]} scale={1.2} />
        <Asset name="banner-red" position={[x * 0.71, 2.5, 0.82]} scale={0.7} />
        <Asset name="lantern" position={[x * 0.73, 1.05, 0.95]} scale={0.76} />
      </group>)}
      <GateDoors progress={leftDoorProgress} />

      {/* Courtyard walls, greenery and props */}
      {[-5.4, 5.4].map((x) => <group key={x}>
        {Array.from({ length: 16 }).map((_, i) => <group key={i}>
          <Asset name="wall-block" position={[x, 0.5, -1 - i * 1.05]} scale={1} />
          <Asset name="wall-block" position={[x, 1.5, -1 - i * 1.05]} scale={1} />
        </group>)}
        {[-3, -8, -13].map((z) => <Asset key={z} name="tree-high" position={[x * 1.18, 0, z]} scale={1.13} />)}
        {[-2.2, -5.2, -8.2, -11.2, -14.2].map((z) => <Asset key={z} name="hedge-large" position={[x * 0.77, 0, z]} rotation={[0, x > 0 ? Math.PI : 0, 0]} scale={1.28} />)}
      </group>)}
      <Asset name="fountain-round" position={[-3.55, 0, -4.9]} scale={1.15} />
      <Asset name="cart" position={[3.55, 0, -4.7]} rotation={[0, -0.42, 0]} scale={0.95} />
      <Asset name="stall-red" position={[3.75, 0, -8.2]} rotation={[0, -0.12, 0]} scale={1.05} />
      <Asset name="stall" position={[-3.7, 0, -8.9]} rotation={[0, 0.15, 0]} scale={0.95} />
      <Asset name="tree-crooked" position={[-4.1, 0, -14.8]} scale={1.18} />
      <Asset name="tree-high" position={[4.4, 0, -15.4]} scale={1.12} />
      <Asset name="banner-green" position={[-4.8, 1.9, -4.7]} rotation={[0, 0.1, 0]} scale={0.68} />
      <Asset name="lantern" position={[4.85, 0.2, -9.4]} scale={0.72} />
      <Asset name="rock-large" position={[-4.8, 0, -12.1]} scale={0.68} />

      {/* 3D words sit behind the sparring guards. Depth testing lets their bodies cut across the letters. */}
      <WorldHeadline progress={progress} />
      <Guard position={[-1.02, 0, -6.9]} facing={0.58} accent="#7c4032" phase={0.25} />
      <Guard position={[1.02, 0, -6.95]} facing={-0.58} accent="#455a66" phase={1.35} />

      {/* Temporary original fantasy critters; swap these groups for approved character GLBs later. */}
      <Critter type="leaf" position={[-3.15, 0, -12.0]} />
      <Critter type="ember" position={[-2.1, 0, -12.55]} />
      <Critter type="spark" position={[3.0, 0, -12.4]} />
      <Sparkles count={90} scale={[12, 5, 28]} size={1.1} speed={0.2} opacity={0.55} color="#e9ce8e" position={[0, 2.2, -8]} />
      <NoticeBoard />
    </>
  )
}

function WorldHeadline({ progress }) {
  const mesh = useRef()
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 2048; canvas.height = 360
    const ctx = canvas.getContext('2d')
    const grad = ctx.createLinearGradient(0, 0, 0, 360)
    grad.addColorStop(0, '#f2e1b3'); grad.addColorStop(1, '#b8864a')
    ctx.fillStyle = grad
    ctx.font = 'bold 142px Georgia, serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.shadowColor = '#100d09'; ctx.shadowBlur = 18
    ctx.fillText('THE REALM AWAITS', 1024, 175)
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])
  useFrame(() => {
    if (mesh.current) {
      mesh.current.material.opacity = smooth(0.24, 0.32, progress) * (1 - smooth(0.46, 0.53, progress))
      mesh.current.visible = progress > 0.23 && progress < 0.54
    }
  })
  return <mesh ref={mesh} position={[0, 3.05, -7.9]}>
    <planeGeometry args={[8.4, 1.48]} />
    <meshBasicMaterial map={texture} transparent opacity={0} depthTest depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
  </mesh>
}

function LoadingCard() {
  return <div className="loading"><div className="loading-sigil">✧</div><div className="loading-title">Opening the realm</div><div className="loading-track"><span /></div><div className="loading-sub">Gathering legends, lanterns and lore</div></div>
}

const notices = [
  { id: 'about', stamp: 'THE CHRONICLER', title: 'Meet your DM', mark: '✦', body: 'I build adventures around meaningful choices, strange worlds, memorable characters, and the stories that emerge at the table. This notice is where your introduction, DM style, and experience can live.' },
  { id: 'campaigns', stamp: 'OPEN CONTRACTS', title: 'Campaigns', mark: '⚔', body: 'Cargo Status Lost — an otherworldly fantasy adventure full of secrets and dangerous bargains. Pokémon Grand Journey — a creature-training adventure across a region of towns, trials, and discoveries. Replace or expand these entries to match your current listings.' },
  { id: 'lore', stamp: 'THE ARCHIVES', title: 'World archives', mark: '⌘', body: 'Explore setting notes, maps, factions, important NPCs, mysteries, and discoveries from the adventures. This section can grow into a proper campaign wiki.' },
  { id: 'guild', stamp: 'JOIN THE GUILD', title: 'Find an adventure', mark: '➶', body: 'Add your StartPlaying listings, Discord invite, booking page, or contact links here. The prototype keeps these as editable content until you provide the final URLs.' },
]

function App() {
  const [progress, setProgress] = useState(0)
  const [selected, setSelected] = useState(null)
  const [muted, setMuted] = useState(true)
  const [view, setView] = useState('realm')
  const [campaigns, setCampaigns] = useState(() => readDemoStorage(CAMPAIGNS_STORAGE_KEY, initialCampaigns))
  const [applications, setApplications] = useState(() => readDemoStorage(APPLICATIONS_STORAGE_KEY, []))
  const lastProgress = useRef(0)

  useEffect(() => saveDemoStorage(CAMPAIGNS_STORAGE_KEY, campaigns), [campaigns])
  useEffect(() => saveDemoStorage(APPLICATIONS_STORAGE_KEY, applications), [applications])

  const navigate = (nextView) => {
    setSelected(null)
    setView(nextView)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  function submitApplication(application) {
    setApplications((current) => [...current, {
      ...application,
      id: createId('application'),
      status: 'pending',
      createdAt: Date.now(),
    }])
  }

  function updateApplication(applicationId, status) {
    setApplications((current) => {
      const target = current.find((application) => application.id === applicationId)
      if (!target || target.status !== 'pending') return current
      if (status === 'approved') {
        const campaign = campaigns.find((item) => item.id === target.campaignId)
        const approvedCount = current.filter((item) => item.campaignId === target.campaignId && item.status === 'approved').length
        if (!campaign || approvedCount >= campaign.capacity) return current
      }
      return current.map((application) => application.id === applicationId ? { ...application, status } : application)
    })
  }

  function saveCampaign(campaign) {
    setCampaigns((current) => current.some((item) => item.id === campaign.id)
      ? current.map((item) => item.id === campaign.id ? campaign : item)
      : [...current, campaign])
  }

  function deleteCampaign(campaignId) {
    setCampaigns((current) => current.filter((campaign) => campaign.id !== campaignId))
    setApplications((current) => current.filter((application) => application.campaignId !== campaignId))
  }

  useEffect(() => {
    const update = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      const next = clamp01(window.scrollY / max)
      lastProgress.current = next
      setProgress(next)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update) }
  }, [])

  useEffect(() => {
    if (view !== 'realm') return undefined
    const sections = gsap.utils.toArray('.story-section')
    sections.forEach((section) => {
      gsap.fromTo(section.querySelectorAll('.reveal'), { y: 24, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.7, stagger: 0.09, ease: 'power2.out',
        scrollTrigger: { trigger: section, start: 'top 68%', end: 'bottom 42%', toggleActions: 'play reverse play reverse' },
      })
    })
    return () => ScrollTrigger.getAll().forEach((t) => t.kill())
  }, [view])

  const activeNotice = notices.find((notice) => notice.id === selected)
  const stage = progress < 0.24 ? 'THE GATE' : progress < 0.5 ? 'THE COURTYARD' : progress < 0.73 ? 'THE WILDLINGS' : 'THE NOTICE BOARD'

  return (
    <div className={`site-shell ${view === 'realm' ? 'realm-home-shell' : 'product-shell'}`}>
      {view === 'realm' && <div className="scene-fixed" aria-hidden="true">
        <Canvas shadows dpr={[1, 1.7]} camera={{ position: [0, 3.4, 10.8], fov: 48 }} gl={{ antialias: true, alpha: false }}>
          <Suspense fallback={null}><World progress={progress} /></Suspense>
        </Canvas>
        <div className="vignette" />
        <div className="film-grain" />
      </div>}

      <header className={`topbar ${view !== 'realm' ? 'product-topbar' : ''}`}>
        <button className="brand brand-button" onClick={() => navigate('realm')} aria-label="Return to The Realm home"><span className="brand-mark">✧</span><span><b>THE REALM</b><small>A DUNGEON MASTER'S WORLD</small></span></button>
        <nav className="site-nav" aria-label="Main navigation">
          <button className={view === 'campaigns' ? 'nav-link active' : 'nav-link'} onClick={() => navigate('campaigns')}>Campaigns</button>
          <button className={view === 'dashboard' ? 'nav-link active' : 'nav-link'} onClick={() => navigate('dashboard')}>DM Console</button>
        </nav>
        <div className="topbar-right">
          {view === 'realm' && <span className="chapter-pill"><i /> {stage}</span>}
          {view === 'realm' && <button className="sound-button" onClick={() => setMuted(!muted)} aria-label="Toggle ambient audio" title="Audio placeholder">{muted ? 'SOUND OFF' : 'SOUND ON'}</button>}
        </div>
      </header>

      {view === 'realm' ? <main id="top">
        <section className="story-section hero-section">
          <div className="hero-copy reveal">
            <div className="eyebrow"><span /> A WORLD OF STORIES, SHARED AT THE TABLE <span /></div>
            <h1>THE FANTASY<br /><em>WORLD AWAITS YOU</em></h1>
            <p>Beyond these gates are forgotten legends, unlikely companions, and adventures waiting to be written.</p>
            <div className="hero-actions"><button className="button-primary" onClick={() => navigate('campaigns')}>Browse campaigns <span aria-hidden="true">↗</span></button><button className="hero-link" onClick={() => navigate('dashboard')}>DM? Manage your realm</button></div>
            <div className="scroll-callout"><span className="scroll-line" /><span>SCROLL TO ENTER</span><span className="down-mark">⌄</span></div>
          </div>
          <div className="corner-coordinate">EST. IN IMAGINATION <span>•</span> OPEN TO ADVENTURERS</div>
        </section>

        <section className="story-section guards-section">
          <div className="section-copy left-copy">
            <div className="eyebrow reveal">CHAPTER I · THE CROSSING</div>
            <h2 className="reveal">Every legend<br />begins <em>somewhere.</em></h2>
            <p className="reveal">Steel rings against steel. The gatekeepers train as if the next great tale might arrive at any moment.</p>
            <div className="micro-note reveal"><span className="note-sigil">✦</span> WATCH YOUR STEP, TRAVELLER</div>
          </div>
          <div className="floating-caption reveal">A CITY BETWEEN<br /><b>THE KNOWN & UNKNOWN</b></div>
        </section>

        <section className="story-section creatures-section">
          <div className="section-copy right-copy">
            <div className="eyebrow reveal">CHAPTER II · UNEXPECTED COMPANY</div>
            <h2 className="reveal">Not every hero<br />carries a <em>sword.</em></h2>
            <p className="reveal">Some watch from the old stone walls. Some become companions. Some may change the course of an entire adventure.</p>
            <div className="micro-note reveal"><span className="note-sigil">✦</span> THERE IS MORE THAN ONE KIND OF MAGIC</div>
          </div>
          <div className="specimen-label reveal"><span>FIELD NOTE 003</span><b>CURIOUS CREATURES</b><small>Seen near the inner courtyard</small></div>
        </section>

        <section className="story-section board-section">
          <div className="board-heading reveal">
            <div className="eyebrow">CHAPTER III · YOUR ADVENTURE STARTS HERE</div>
            <h2>The Guild <em>Notice Board</em></h2>
            <p>Pull a notice from the board. Find the stories, worlds, and games waiting beyond this page.</p>
          </div>
          <div className="notice-grid">
            {notices.map((notice, index) => <button className={`notice-card reveal notice-${index + 1}`} key={notice.id} onClick={() => setSelected(notice.id)}>
              <span className="paper-stamp">{notice.stamp}</span><span className="paper-mark">{notice.mark}</span><b>{notice.title}</b><span className="paper-rule" /><span className="read-note">READ NOTICE <span>↗</span></span>
            </button>)}
          </div>
          <div className="home-campaign-cta"><span><b>Looking for a table?</b><small>Browse current listings and request a seat.</small></span><button className="button-primary" onClick={() => navigate('campaigns')}>Open campaign registry ↗</button></div>
          <footer className="site-footer"><span>MADE FOR ADVENTURERS & STORYTELLERS</span><span>THE REALM AWAITS · <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>RETURN TO THE GATE ↑</button></span></footer>
        </section>
      </main> : view === 'campaigns' ? <CampaignDirectory campaigns={campaigns} applications={applications} onSubmitApplication={submitApplication} onNavigate={navigate} /> : <DmDashboard campaigns={campaigns} applications={applications} onNavigate={navigate} onSaveCampaign={saveCampaign} onDeleteCampaign={deleteCampaign} onUpdateApplication={updateApplication} />}

      {view === 'realm' && <>
        <div className="scroll-progress" aria-hidden="true"><span style={{ transform: `scaleX(${progress})` }} /></div>
        <div className="side-index" aria-hidden="true"><span>01</span><i /><span>04</span></div>
        {activeNotice && <div className="modal-backdrop" role="presentation" onClick={() => setSelected(null)}>
          <article className="notice-modal" role="dialog" aria-modal="true" aria-labelledby="notice-title" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)} aria-label="Close notice">✕</button>
            <div className="eyebrow">{activeNotice.stamp}</div><div className="modal-sigil">{activeNotice.mark}</div>
            <h2 id="notice-title">{activeNotice.title}</h2><p>{activeNotice.body}</p>
            <div className="modal-bottom"><span>THE GUILD ARCHIVES</span><button onClick={() => setSelected(null)}>BACK TO THE BOARD ↗</button></div>
          </article>
        </div>}
      </>}
    </div>
  )
}

export default App
