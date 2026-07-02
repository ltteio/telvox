import React, { useEffect, useRef, useState } from 'react';
import { 
  Play, Pause, RotateCcw, Eye, Gauge, Cpu, Dumbbell, Activity, 
  Tv, Compass, HelpCircle, CornerDownRight, Volume2, Sparkles 
} from 'lucide-react';

interface LiveDemonstrationPlayerProps {
  drillName: string;
  videoDemoName: string;
}

type ViewModeType = 'tactical' | 'biomechanical' | 'telemetry';

export default function LiveDemonstrationPlayer({ drillName, videoDemoName }: LiveDemonstrationPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<number>(1); // 0.5, 1, 1.5, 2
  const [viewMode, setViewMode] = useState<ViewModeType>('tactical');
  const [coachingSub, setCoachingSub] = useState<string>('Pre-activation du jumeau numérique...');
  const [interactiveCones, setInteractiveCones] = useState<{ x: number; y: number; color: string }[]>([]);
  const [telemetry, setTelemetry] = useState({
    speedKmh: 0,
    heartRate: 110,
    jointAngle: 180,
    intensityZone: 'Aérobie',
    phase: 'Initialisation'
  });

  // Keep a reference to animation frame
  const requestRef = useRef<number | null>(null);
  // Keep track of internal simulation time
  const tRef = useRef<number>(0);

  // Default setup of cones for interactive placement
  useEffect(() => {
    // Reset interactive cones when drill changes
    setInteractiveCones([]);
  }, [videoDemoName]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI screens
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    let animationFrameId: number;

    const render = () => {
      const w = rect.width;
      const h = rect.height;

      // Clear with dark tech theme background
      ctx.fillStyle = '#0b1329'; // deep slate space background
      ctx.fillRect(0, 0, w, h);

      // 1. Draw Field / Tactical Grid Lines
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)'; // faint cyan grid lines
      ctx.lineWidth = 1;
      const gridSize = 20;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw pitch boundary lines in tactical view
      if (viewMode === 'tactical') {
        ctx.strokeStyle = 'rgba(2, 195, 154, 0.15)'; // glowing mint border
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, w - 20, h - 20);

        // Center line
        ctx.beginPath();
        ctx.moveTo(w / 2, 10);
        ctx.lineTo(w / 2, h - 10);
        ctx.stroke();

        // Center circle
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 40, 0, Math.PI * 2);
        ctx.stroke();

        // Goal outline (Right side)
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
        ctx.strokeRect(w - 20, h / 2 - 35, 10, 70);
      }

      // Update simulation time if playing
      if (isPlaying) {
        tRef.current += 0.03 * speed;
      }

      const t = tRef.current;

      // Render the specific interactive animation pattern
      if (videoDemoName === 'WallControl' || videoDemoName === 'WallControl_left') {
        // --- WALL CONTROL DEMONSTRATION ---
        const wallX = w - 60;
        const playerX = 80;
        const centerY = h / 2;

        // Draw Wall
        ctx.fillStyle = '#334155';
        ctx.fillRect(wallX, centerY - 50, 8, 100);
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.strokeRect(wallX, centerY - 50, 8, 100);

        // Grid of cones representing feet position guide
        const cones = [
          { x: playerX + 40, y: centerY - 30, color: '#f59e0b' },
          { x: playerX + 40, y: centerY + 30, color: '#f59e0b' }
        ];

        // Draw cones
        cones.concat(interactiveCones).forEach(c => {
          ctx.beginPath();
          ctx.fillStyle = c.color;
          ctx.moveTo(c.x, c.y - 6);
          ctx.lineTo(c.x - 6, c.y + 6);
          ctx.lineTo(c.x + 6, c.y + 6);
          ctx.closePath();
          ctx.fill();
          // Glow around cones
          ctx.shadowBlur = 8;
          ctx.shadowColor = c.color;
          ctx.strokeStyle = 'rgba(255,255,255,0.4)';
          ctx.stroke();
          ctx.shadowBlur = 0; // reset
        });

        // Ball & Player kinematics calculation
        // Phase loop of 4 seconds (period 4)
        const cycle = t % 4; 
        let ballX = playerX;
        let ballY = centerY;
        let currPlayerX = playerX;
        let currPlayerY = centerY;
        let commentary = '';
        let heartRate = 125;
        let currentKmh = 12.5;

        if (cycle < 1.2) {
          // Phase 1: Passing the ball to the wall
          const progress = cycle / 1.2;
          ballX = playerX + (wallX - playerX) * progress;
          ballY = centerY;
          commentary = "Étape 1 : Passe appuyée à ras de terre contre le mur.";
          heartRate = 120 + Math.sin(t) * 5;
          currentKmh = 18.0;
        } else if (cycle < 2.2) {
          // Phase 2: Ball rebound and coming back
          const progress = (cycle - 1.2) / 1.0;
          ballX = wallX - (wallX - (playerX + 40)) * progress;
          ballY = centerY;
          commentary = "Étape 2 : Recul dynamique pour anticiper le rebond.";
          heartRate = 128;
          currentKmh = 14.5;
        } else if (cycle < 3.2) {
          // Phase 3: Player controls to the side
          const progress = (cycle - 2.2) / 1.0;
          ballX = (playerX + 40) - 20 * progress;
          ballY = centerY + 25 * progress; // Controls down to the cone
          currPlayerX = playerX + 15 * progress;
          currPlayerY = centerY + 20 * progress;
          commentary = "Étape 3 : Contrôle orienté pied gauche pour éliminer l'angle.";
          heartRate = 135;
          currentKmh = 8.2;
        } else {
          // Phase 4: Recover and reset back to center
          const progress = (cycle - 3.2) / 0.8;
          ballX = (playerX + 20) + (playerX - (playerX + 20)) * progress;
          ballY = (centerY + 25) + (centerY - (centerY + 25)) * progress;
          currPlayerX = (playerX + 15) + (playerX - (playerX + 15)) * progress;
          currPlayerY = (centerY + 20) + (centerY - (centerY + 20)) * progress;
          commentary = "Étape 4 : Repositionnement rapide et transfert de poids.";
          heartRate = 126;
          currentKmh = 9.8;
        }

        // Draw Player Marker
        drawPlayerMarker(ctx, currPlayerX, currPlayerY, '#06b6d4', 'YOU', viewMode, t);
        
        // Draw Ball
        drawBall(ctx, ballX, ballY, t);

        // Biomechanical Overlay
        if (viewMode === 'biomechanical') {
          drawSkeletonOverlay(ctx, currPlayerX, currPlayerY, ballX, ballY, t);
        }

        // Update telemetry states for output displays
        setTelemetry({
          speedKmh: parseFloat(currentKmh.toFixed(1)),
          heartRate: Math.round(heartRate),
          jointAngle: Math.round(135 + Math.sin(t * 1.5) * 35),
          intensityZone: 'Seuil Cardio',
          phase: cycle < 2.2 ? 'Transmission' : 'Contrôle Technique'
        });

        setCoachingSub(commentary);

      } else if (videoDemoName === 'SprintShuttle') {
        // --- SPRINT SHUTTLE WITH AGILITY CONES ---
        const cones = [
          { x: 50, y: h / 2, color: '#f59e0b' },
          { x: 120, y: h / 2 - 40, color: '#f59e0b' },
          { x: 190, y: h / 2 + 40, color: '#f59e0b' },
          { x: 260, y: h / 2 - 40, color: '#f59e0b' },
          { x: 330, y: h / 2, color: '#f59e0b' }
        ];

        // Draw track cones
        cones.concat(interactiveCones).forEach(c => {
          ctx.beginPath();
          ctx.fillStyle = c.color;
          ctx.moveTo(c.x, c.y - 6);
          ctx.lineTo(c.x - 6, c.y + 6);
          ctx.lineTo(c.x + 6, c.y + 6);
          ctx.closePath();
          ctx.fill();
        });

        // Player movement back and forth
        const duration = 5; // cycle duration
        const cycle = t % duration;
        const segment = duration / 4;
        let px = 50, py = h / 2;
        let commentary = '';
        let speedVal = 0;
        let hr = 145;

        // Trace path trail
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(50, h/2);
        ctx.lineTo(120, h/2 - 40);
        ctx.lineTo(190, h/2 + 40);
        ctx.lineTo(260, h/2 - 40);
        ctx.lineTo(330, h/2);
        ctx.stroke();

        if (cycle < segment) {
          const p = cycle / segment;
          px = 50 + (120 - 50) * p;
          py = (h / 2) + ((h / 2 - 40) - (h / 2)) * p;
          commentary = "SÉQUENCE 1 : Séquence d'accélération explosive sur le premier cône.";
          speedVal = 18.2 + p * 12; // accelerate
          hr = 140 + Math.round(p * 10);
        } else if (cycle < segment * 2) {
          const p = (cycle - segment) / segment;
          px = 120 + (190 - 120) * p;
          py = (h / 2 - 40) + ((h / 2 + 40) - (h / 2 - 40)) * p;
          commentary = "SÉQUENCE 2 : Appuis bas lors du pivotement brusque à 90 degrés.";
          speedVal = 30.2 - p * 14; // decelerate to pivot
          hr = 152 + Math.round(p * 8);
        } else if (cycle < segment * 3) {
          const p = (cycle - segment * 2) / segment;
          px = 190 + (260 - 190) * p;
          py = (h / 2 + 40) + ((h / 2 - 40) - (h / 2 + 40)) * p;
          commentary = "SÉQUENCE 3 : Redressement du buste et poussée forte des métatarses.";
          speedVal = 16.5 + p * 13;
          hr = 160 + Math.round(p * 5);
        } else {
          const p = (cycle - segment * 3) / segment;
          px = 260 + (330 - 260) * p;
          py = (h / 2 - 40) + ((h / 2) - (h / 2 - 40)) * p;
          commentary = "SÉQUENCE 4 : Sprint terminal haute intensité pour franchir la ligne.";
          speedVal = 29.5 - p * 20; // slow down at end
          hr = 165 - Math.round(p * 15);
        }

        // Draw Player
        drawPlayerMarker(ctx, px, py, '#10b981', 'YOU', viewMode, t);

        if (viewMode === 'biomechanical') {
          drawSkeletonOverlay(ctx, px, py, px + 5, py + 5, t);
        }

        setTelemetry({
          speedKmh: parseFloat(speedVal.toFixed(1)),
          heartRate: hr,
          jointAngle: Math.round(110 + Math.sin(t * 2) * 40),
          intensityZone: 'Puissance Anaérobie',
          phase: 'Changement d\'appuis'
        });

        setCoachingSub(commentary);

      } else if (videoDemoName === 'ScanTraining') {
        // --- SCAN TRAINING SYSTEM ---
        const px = w / 2;
        const py = h / 2;

        // Cones representing the peripheral flashing points
        const targetCones = [
          { name: 'N', x: px, y: py - 50, color: '#ef4444', active: false },
          { name: 'S', x: px, y: py + 50, color: '#3b82f6', active: false },
          { name: 'W', x: px - 65, y: py, color: '#eab308', active: false },
          { name: 'E', x: px + 65, y: py, color: '#10b981', active: false }
        ];

        // Active index flashes every 2.5 seconds
        const activeIdx = Math.floor(t / 2.5) % 4;
        targetCones[activeIdx].active = true;

        // Draw peripheral lights
        targetCones.forEach((tc, idx) => {
          ctx.beginPath();
          ctx.arc(tc.x, tc.y, 8, 0, Math.PI * 2);
          ctx.fillStyle = tc.active ? tc.color : '#1e293b';
          ctx.fill();
          ctx.strokeStyle = tc.active ? '#ffffff' : 'rgba(255,255,255,0.1)';
          ctx.lineWidth = tc.active ? 2.5 : 1;
          ctx.stroke();

          // Render a glowing ring around active scanning targets
          if (tc.active) {
            ctx.shadowBlur = 12;
            ctx.shadowColor = tc.color;
            ctx.strokeStyle = tc.color;
            ctx.beginPath();
            ctx.arc(tc.x, tc.y, 14 + Math.sin(t * 8) * 3, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        });

        // Player rotates head to scan
        const targetAngle = Math.atan2(targetCones[activeIdx].y - py, targetCones[activeIdx].x - px);
        // interpolate rotation
        const viewAngle = targetAngle + Math.sin(t * 4) * 0.15;

        // Draw player vision cone (the Scan light sweep)
        ctx.fillStyle = 'rgba(6, 182, 212, 0.12)';
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.arc(px, py, 75, viewAngle - 0.4, viewAngle + 0.4);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + Math.cos(viewAngle - 0.4) * 75, py + Math.sin(viewAngle - 0.4) * 75);
        ctx.moveTo(px, py);
        ctx.lineTo(px + Math.cos(viewAngle + 0.4) * 75, py + Math.sin(viewAngle + 0.4) * 75);
        ctx.stroke();

        // Draw Player
        drawPlayerMarker(ctx, px, py, '#06b6d4', 'SCAN', viewMode, t, viewAngle);

        setTelemetry({
          speedKmh: 1.5,
          heartRate: 112,
          jointAngle: Math.round(90 + Math.abs(Math.sin(t)) * 45),
          intensityZone: 'Cognition / Neuro-éveil',
          phase: 'Scan Visuel Continu'
        });

        setCoachingSub(`Garde le ballon vivant sous la semelle, scanne le plot ${targetCones[activeIdx].name} de couleur ${targetCones[activeIdx].color === '#ef4444' ? 'Rouge' : targetCones[activeIdx].color === '#3b82f6' ? 'Bleu' : targetCones[activeIdx].color === '#eab308' ? 'Jaune' : 'Vert'} derrière toi.`);

      } else if (videoDemoName === 'WingDribble') {
        // --- WING DRIBBLE & CROCHET OUTSIDE ---
        const defenders = [
          { x: 100, y: h / 2 + 10 },
          { x: 190, y: h / 2 - 15 },
          { x: 270, y: h / 2 + 20 }
        ];

        // Draw static defenders (red markers)
        defenders.concat(interactiveCones).forEach((def, idx) => {
          ctx.beginPath();
          ctx.arc(def.x, def.y, 8, 0, Math.PI * 2);
          ctx.fillStyle = '#ef4444'; // Red for opponents
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.stroke();
          
          // Draw opponent circle shield representing direct hazard zone
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.1)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(def.x, def.y, 24, 0, Math.PI * 2);
          ctx.stroke();
        });

        // Ball & Player kinematics calculation
        const cycle = t % 6; // 6 seconds loop
        let px = 40, py = h / 2 + 30;
        let bx = 50, by = h / 2 + 30;
        let comm = '';
        let heart = 138;
        let velocity = 15;

        if (cycle < 1.8) {
          // Approach defender 1
          const p = cycle / 1.8;
          px = 40 + (defenders[0].x - 30 - 40) * p;
          py = (h / 2 + 30) + (defenders[0].y + 15 - (h / 2 + 30)) * p;
          bx = px + 10;
          by = py - 2;
          comm = "Phase 1 : Prise de vitesse d'ailier, approche frontale du premier défenseur.";
          velocity = 18.5 + p * 10;
        } else if (cycle < 3.2) {
          // Break, sharp cut (crossover crochet) to eliminate defender 1
          const p = (cycle - 1.8) / 1.4;
          px = (defenders[0].x - 30) + (defenders[1].x - 20 - (defenders[0].x - 30)) * p;
          py = (defenders[0].y + 15) + (defenders[1].y - 25 - (defenders[0].y + 15)) * p;
          
          // Ball is pushed sharply to side
          bx = px + 15 * Math.cos(p * Math.PI);
          by = py - 10 * Math.sin(p * Math.PI);
          
          comm = "Phase 2 : Feinte d'épaule et crochet extérieur foudroyant !";
          velocity = 26.5 - p * 8;
          heart = 152;
        } else if (cycle < 4.8) {
          // Accelerate past defender 2 and shoot
          const p = (cycle - 3.2) / 1.6;
          px = (defenders[1].x - 20) + (w - 100 - (defenders[1].x - 20)) * p;
          py = (defenders[1].y - 25) + (h / 2 - (defenders[1].y - 25)) * p;
          bx = px + 8;
          by = py + 2;
          comm = "Phase 3 : Élimination directe, préparation de la frappe pied gauche.";
          velocity = 32.4; // Max acceleration sprint
          heart = 166;
        } else {
          // Shoot ball into top corner of right goal net
          const p = (cycle - 4.8) / 1.2;
          px = w - 100;
          py = h / 2;
          // Ball flies towards Right Goal net
          bx = (w - 100) + (w - 15 - (w - 100)) * p;
          by = (h / 2) + ((h / 2 - 25) - (h / 2)) * p;
          comm = "Phase 4 : Enroulé clinique pied gauche en lucarne opposée ! GOAL ⚽";
          velocity = 12; // player decelerates/celebrates
          heart = 158;

          // Goal ripple spark impact effect!
          if (p > 0.8) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#10b981';
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(w - 15, h / 2 - 25, 12 * p, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }

        // Draw Player Marker
        drawPlayerMarker(ctx, px, py, '#06b6d4', 'YOU', viewMode, t);
        
        // Draw Ball
        drawBall(ctx, bx, by, t);

        if (viewMode === 'biomechanical') {
          drawSkeletonOverlay(ctx, px, py, bx, by, t);
        }

        setTelemetry({
          speedKmh: parseFloat(velocity.toFixed(1)),
          heartRate: heart,
          jointAngle: Math.round(145 + Math.cos(t * 3) * 25),
          intensityZone: 'Zone Match VMax',
          phase: cycle < 3.2 ? 'Dribble d\'élimination' : 'Finition en course'
        });

        setCoachingSub(comm);

      } else {
        // --- BIOMECHANICAL STRETCH / PLANK FLOWS ---
        // Animate a biomechanical stylized vector stick-figure executing core/stretches
        const px = w / 2;
        const py = h / 2 + 20;
        
        // Render stylized floor line
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(40, py + 20);
        ctx.lineTo(w - 40, py + 20);
        ctx.stroke();

        // Hip and knee movements using simple trigonometric math
        const speedFactor = speed * 1.5;
        const angleSine = Math.sin(t * speedFactor);
        
        let shoulderX = px - 40;
        let shoulderY = py - 10 + angleSine * 6;
        let hipX = px;
        let hipY = py + angleSine * 10;
        let kneeX = px + 40;
        let kneeY = py + 12 - Math.abs(angleSine) * 5;
        let ankleX = px + 75;
        let ankleY = py + 18;

        let elbowX = px - 55;
        let elbowY = py + 15;
        let wristX = px - 45;
        let wristY = py + 18;

        let headX = px - 60;
        let headY = py - 22 + angleSine * 4;

        // Draw Joint circles and Bones lines
        ctx.strokeStyle = '#10b981'; // Green for active posture safety
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';

        // Head
        ctx.beginPath();
        ctx.arc(headX, headY, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#1e293b';
        ctx.fill();
        ctx.stroke();

        // Neck
        ctx.beginPath();
        ctx.moveTo(headX, headY + 5);
        ctx.lineTo(shoulderX, shoulderY);
        ctx.stroke();

        // Spine
        ctx.beginPath();
        ctx.moveTo(shoulderX, shoulderY);
        ctx.lineTo(hipX, hipY);
        ctx.stroke();

        // Femur (Thigh)
        ctx.beginPath();
        ctx.moveTo(hipX, hipY);
        ctx.lineTo(kneeX, kneeY);
        ctx.stroke();

        // Tibia (Calf)
        ctx.beginPath();
        ctx.moveTo(kneeX, kneeY);
        ctx.lineTo(ankleX, ankleY);
        ctx.stroke();

        // Support Arm (Plank elbow position)
        ctx.beginPath();
        ctx.moveTo(shoulderX, shoulderY);
        ctx.lineTo(elbowX, elbowY);
        ctx.lineTo(wristX, wristY);
        ctx.stroke();

        // Glowing Joint Nodes (Biomechanical Markers)
        const joints = [
          { name: 'Épaule', x: shoulderX, y: shoulderY, color: '#22c55e' },
          { name: 'Hanche', x: hipX, y: hipY, color: '#3b82f6' },
          { name: 'Genou', x: kneeX, y: kneeY, color: '#eab308' },
          { name: 'Cheville', x: ankleX, y: ankleY, color: '#a855f7' }
        ];

        joints.forEach(j => {
          ctx.beginPath();
          ctx.arc(j.x, j.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.strokeStyle = j.color;
          ctx.lineWidth = 2;
          ctx.stroke();
          
          if (viewMode === 'biomechanical' || viewMode === 'telemetry') {
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.font = '8px monospace';
            ctx.fillText(j.name, j.x + 6, j.y + 2);
          }
        });

        // Breathing cycle wave circle animation to assist breathing rhythm
        const breatheSize = 25 + Math.sin(t * 1.5) * 12;
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(px, py - 40, breatheSize, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(6, 182, 212, 0.05)';
        ctx.beginPath();
        ctx.arc(px, py - 40, breatheSize - 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#06b6d4';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(Math.sin(t * 1.5) > 0 ? 'INSPIRE' : 'EXPIRE', px, py - 38);
        ctx.textAlign = 'left'; // reset

        setTelemetry({
          speedKmh: 0,
          heartRate: Math.round(85 + Math.sin(t) * 4),
          jointAngle: Math.round(180 - Math.abs(angleSine) * 35),
          intensityZone: 'Régénération / Calme',
          phase: Math.sin(t * 1.5) > 0 ? 'Expansion abdominale' : 'Détente postural'
        });

        setCoachingSub("Focalise sur ta sangle abdominale. Garde le dos plat. Aligne tes fesses avec les épaules pour neutraliser l'effort.");
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, speed, viewMode, videoDemoName, interactiveCones]);

  // Handle manual clicks to place extra cones on tactical pitch
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Cycle through visual colors for player markers vs opponents vs targets
    const colors = ['#f59e0b', '#ef4444', '#10b981'];
    const selectedColor = colors[interactiveCones.length % colors.length];

    if (interactiveCones.length >= 6) {
      // Keep max 6 custom cones to avoid screen clutter
      setInteractiveCones([{ x: clickX, y: clickY, color: '#f59e0b' }]);
    } else {
      setInteractiveCones(prev => [...prev, { x: clickX, y: clickY, color: selectedColor }]);
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl space-y-4">
      
      {/* Visual Header of the player */}
      <div className="bg-slate-900 px-4 py-3 border-b border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
            <Tv className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <span className="block text-[10px] font-mono text-cyan-400 uppercase font-black tracking-widest">Démonstrateur Interactif de Drills</span>
            <span className="block text-xs font-sans font-bold text-white">{drillName}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="hidden sm:inline-flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] px-2 py-0.5 rounded-full font-mono font-bold uppercase">
            <Sparkles className="w-2.5 h-2.5 animate-pulse" />
            <span>Simulateur Direct</span>
          </span>
          <span className="text-[10px] font-mono text-slate-500">Demo Code: {videoDemoName}</span>
        </div>
      </div>

      {/* Main interactive stage canvas */}
      <div className="relative group px-4">
        <canvas 
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-56 bg-slate-950 rounded-xl border border-slate-800/80 cursor-crosshair shadow-inner"
          title="Clique sur le terrain pour ajouter des plots ou obstacles interactifs !"
        />

        {/* Live Audio Guide subtitle overlay */}
        <div className="absolute bottom-4 left-6 right-6 bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-2 flex items-center space-x-2.5 backdrop-blur-sm shadow-xl">
          <Volume2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <p className="text-[10px] sm:text-xs font-mono text-slate-200 leading-snug">
            {coachingSub}
          </p>
        </div>

        {/* Hint tooltip */}
        <div className="absolute top-3 left-6 bg-slate-950/70 border border-slate-900 rounded-lg px-2 py-1 text-[8px] font-mono text-slate-500 uppercase">
          💡 Clique sur le terrain pour poser un plot
        </div>
      </div>

      {/* Control console bar */}
      <div className="px-4 pb-4 space-y-3.5">
        
        {/* Core buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Play, Pause, Reset */}
          <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800/80 p-1 rounded-xl">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-2 rounded-lg transition-all ${isPlaying ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white hover:bg-slate-850'}`}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => { tRef.current = 0; }}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-850 rounded-lg transition-all"
              title="Recommencer la boucle"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800/80 p-1 rounded-xl">
            <span className="px-2 text-[9px] font-mono text-slate-500 uppercase font-black">Vitesse</span>
            {[0.5, 1, 1.5, 2].map(s => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-1 text-[9px] font-mono font-bold rounded ${speed === s ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Camera View Mode */}
          <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800/80 p-1 rounded-xl">
            {[
              { id: 'tactical', label: 'Tactique 2D', icon: Compass },
              { id: 'biomechanical', label: 'Mécanique 3D', icon: Cpu },
              { id: 'telemetry', label: 'Télémétrie', icon: Activity }
            ].map(v => {
              const Icon = v.icon;
              return (
                <button
                  key={v.id}
                  onClick={() => setViewMode(v.id as ViewModeType)}
                  className={`px-2 py-1 text-[9px] font-mono font-black rounded flex items-center space-x-1 uppercase ${viewMode === v.id ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white hover:bg-slate-850'}`}
                >
                  <Icon className="w-3 h-3" />
                  <span className="hidden sm:inline">{v.label}</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Telemetry output cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 border-t border-slate-900">
          <div className="bg-slate-900/60 border border-slate-900 p-2 rounded-xl text-center">
            <span className="block text-[8px] font-mono text-slate-500 uppercase">Vélocité Max</span>
            <span className="block text-sm font-sans font-black text-white mt-0.5">{telemetry.speedKmh} km/h</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-900 p-2 rounded-xl text-center">
            <span className="block text-[8px] font-mono text-slate-500 uppercase">Fréquence Cardiaque</span>
            <span className="block text-sm font-sans font-black text-emerald-400 mt-0.5">{telemetry.heartRate} bpm</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-900 p-2 rounded-xl text-center">
            <span className="block text-[8px] font-mono text-slate-500 uppercase">Flexion Genou</span>
            <span className="block text-sm font-sans font-black text-yellow-400 mt-0.5">{telemetry.jointAngle}°</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-900 p-2 rounded-xl text-center">
            <span className="block text-[8px] font-mono text-slate-500 uppercase">Zone d'Intensité</span>
            <span className="block text-[9px] font-mono font-extrabold text-cyan-400 mt-1 uppercase truncate">{telemetry.intensityZone}</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-900 p-2 rounded-xl text-center col-span-2 sm:col-span-1">
            <span className="block text-[8px] font-mono text-slate-500 uppercase">Séquence</span>
            <span className="block text-[9px] font-mono text-slate-300 mt-1 uppercase truncate">{telemetry.phase}</span>
          </div>
        </div>

      </div>

    </div>
  );
}

// Drawing Utilities to render on HTML5 Canvas
function drawPlayerMarker(
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  color: string, 
  label: string, 
  viewMode: ViewModeType,
  t: number,
  viewAngle: number = 0
) {
  // Glow effect around player
  ctx.shadowBlur = 10;
  ctx.shadowColor = color;

  // Render a futuristic ring outer border
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 11 + Math.sin(t * 6) * 1.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0; // reset

  // Player body circle
  ctx.fillStyle = '#0b1329';
  ctx.beginPath();
  ctx.arc(x, y, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();

  // If head direction angle specified, draw a direction nose
  if (viewAngle !== 0) {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(viewAngle) * 9, y + Math.sin(viewAngle) * 9);
    ctx.stroke();
  }

  // Label
  if (viewMode !== 'biomechanical') {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px sans-serif';
    ctx.fillText(label, x - 8, y - 16);
  }
}

function drawBall(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
  // Golden soccer ball marker
  ctx.shadowBlur = 12;
  ctx.shadowColor = '#eab308'; // Amber gold
  
  // outer glow ring
  ctx.strokeStyle = 'rgba(234, 179, 8, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, 7 + Math.sin(t * 12) * 1, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fill();

  // Draw ball panels crosshair design
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(x - 4, y);
  ctx.lineTo(x + 4, y);
  ctx.moveTo(x, y - 4);
  ctx.lineTo(x, y + 4);
  ctx.stroke();
}

function drawSkeletonOverlay(ctx: CanvasRenderingContext2D, px: number, py: number, bx: number, by: number, t: number) {
  // Draw biomechanical tracking vectors lines between player and ball
  ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)'; // purple vector
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(bx, by);
  ctx.stroke();
  ctx.setLineDash([]); // reset

  // Draw dynamic tracking text coordinate above the vector
  const mx = (px + bx) / 2;
  const my = (py + by) / 2 - 8;
  const dist = Math.sqrt((px - bx) ** 2 + (py - by) ** 2);
  
  ctx.fillStyle = '#a855f7';
  ctx.font = '8px monospace';
  ctx.fillText(`Dist: ${(dist / 10).toFixed(1)}m`, mx - 18, my);
}
