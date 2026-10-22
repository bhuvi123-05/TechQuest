import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  LevelConfig,
  PlayerState,
  EnemyDef,
  CoinDef,
  PlatformDef,
  HazardDef,
} from '../game/types.ts';
import { checkAABB } from '../game/rules.ts';
import { sound } from '../game/sound.ts';
import { WORLDS } from '../game/levels.ts';

interface GameCanvasProps {
  level: LevelConfig;
  isPaused: boolean;
  onUpdateHud: (stats: {
    health: number;
    lives: number;
    score: number;
    coins: number;
    hasKey: boolean;
    interactPrompt: string | null;
  }) => void;
  onOpenTerminal: () => void;
  onLevelComplete: (stats: {
    score: number;
    coinsCollected: number;
    timeTakenSec: number;
    livesRemaining: number;
    enemiesDefeated: number;
  }) => void;
  onGameOver: (stats: { score: number }) => void;
  // External triggers for mobile controls
  externalInputRef: React.MutableRefObject<{
    left: boolean;
    right: boolean;
    jump: boolean;
    dash: boolean;
    interact: boolean;
  }>;
}

interface Particle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  level,
  isPaused,
  onUpdateHud,
  onOpenTerminal,
  onLevelComplete,
  onGameOver,
  externalInputRef,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Keep references to mutable simulation objects so RAF never recreates them
  const simState = useRef({
    player: {
      x: level.spawnPoint.x,
      y: level.spawnPoint.y,
      vx: 0,
      vy: 0,
      w: 28,
      h: 38,
      facing: 1 as 1 | -1,
      isGrounded: false,
      jumpCount: 0,
      coyoteTimer: 0,
      jumpBufferTimer: 0,
      health: 3,
      maxHealth: 3,
      lives: 3,
      invulnerableTimer: 0,
      squashX: 1,
      squashY: 1,
      isDashing: false,
      dashTimer: 0,
      dashCooldown: 0,
    } as PlayerState,
    checkpoint: { x: level.spawnPoint.x, y: level.spawnPoint.y },
    enemies: JSON.parse(JSON.stringify(level.enemies)) as EnemyDef[],
    coins: JSON.parse(JSON.stringify(level.coins)) as CoinDef[],
    keys: JSON.parse(JSON.stringify(level.keys)),
    hasKey: false,
    terminalSolved: false,
    score: 0,
    coinsCollected: 0,
    enemiesDefeated: 0,
    timeTakenSec: 0,
    hitstopTimer: 0,
    cameraShake: 0,
    camX: 0,
    camY: 0,
    isComplete: false,
    isDefeated: false,
    interactableTarget: null as 'terminal' | 'portal' | null,
    movingPlatforms: level.platforms
      .filter((p) => p.type === 'moving')
      .map((p) => ({ ...p, dir: 1, curX: p.x, curY: p.y })),
  });

  // Fixed Particle Ring Buffer (zero GC inside loop)
  const MAX_PARTICLES = 120;
  const particlesRef = useRef<Particle[]>(
    Array.from({ length: MAX_PARTICLES }, () => ({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 0.5,
      color: '#38bdf8',
      size: 3,
    }))
  );

  const spawnParticles = (x: number, y: number, count: number, color: string, speed = 120) => {
    let spawned = 0;
    const pool = particlesRef.current;
    for (let i = 0; i < pool.length && spawned < count; i++) {
      if (!pool[i].active) {
        const angle = Math.random() * Math.PI * 2;
        const vel = Math.random() * speed + 30;
        pool[i].active = true;
        pool[i].x = x;
        pool[i].y = y;
        pool[i].vx = Math.cos(angle) * vel;
        pool[i].vy = Math.sin(angle) * vel - 40;
        pool[i].life = 0;
        pool[i].maxLife = Math.random() * 0.4 + 0.2;
        pool[i].color = color;
        pool[i].size = Math.random() * 3 + 2;
        spawned++;
      }
    }
  };

  // Keyboard input tracking
  const keysDown = useRef<Record<string, boolean>>({});
  const justPressed = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyE', 'ShiftLeft'].includes(
          e.code
        )
      ) {
        e.preventDefault();
      }
      if (!keysDown.current[e.code]) {
        justPressed.current[e.code] = true;
      }
      keysDown.current[e.code] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDown.current[e.code] = false;
    };

    const handleBlur = () => {
      keysDown.current = {};
      justPressed.current = {};
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleBlur);
    };
  }, []);

  // Main 60fps simulation and render loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    let hudThrottleTime = 0;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset sim state when level changes
    simState.current.player.x = level.spawnPoint.x;
    simState.current.player.y = level.spawnPoint.y;
    simState.current.player.vx = 0;
    simState.current.player.vy = 0;
    simState.current.player.health = 3;
    simState.current.player.lives = 3;
    simState.current.checkpoint = { x: level.spawnPoint.x, y: level.spawnPoint.y };
    simState.current.enemies = JSON.parse(JSON.stringify(level.enemies));
    simState.current.coins = JSON.parse(JSON.stringify(level.coins));
    simState.current.keys = JSON.parse(JSON.stringify(level.keys));
    simState.current.hasKey = false;
    simState.current.terminalSolved = false;
    simState.current.score = 0;
    simState.current.coinsCollected = 0;
    simState.current.enemiesDefeated = 0;
    simState.current.timeTakenSec = 0;
    simState.current.isComplete = false;
    simState.current.isDefeated = false;

    const GRAVITY = 1100;
    const RUN_SPEED = 260;
    const JUMP_SPEED = -510;
    const FRICTION = 0.84;

    const gameLoop = (currentTime: number) => {
      const rawDt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      const dt = Math.min(rawDt, 0.05);

      const state = simState.current;
      const player = state.player;
      const ext = externalInputRef.current;

      // Handle hitstop freeze
      let simDt = dt;
      if (state.hitstopTimer > 0) {
        state.hitstopTimer -= dt;
        simDt = 0;
      }

      if (!isPaused && !state.isComplete && !state.isDefeated) {
        state.timeTakenSec += simDt;

        // Process discrete input triggers
        const inputLeft = keysDown.current['KeyA'] || keysDown.current['ArrowLeft'] || ext.left;
        const inputRight = keysDown.current['KeyD'] || keysDown.current['ArrowRight'] || ext.right;
        const inputJumpJustPressed =
          justPressed.current['Space'] ||
          justPressed.current['KeyW'] ||
          justPressed.current['ArrowUp'] ||
          ext.jump;
        const inputJumpHeld =
          keysDown.current['Space'] || keysDown.current['KeyW'] || keysDown.current['ArrowUp'] || ext.jump;
        const inputDash =
          justPressed.current['ShiftLeft'] || justPressed.current['KeyK'] || ext.dash;
        const inputInteract =
          justPressed.current['KeyE'] || ext.interact;

        // Reset one-shot edges
        justPressed.current = {};
        if (ext.jump) ext.jump = false;
        if (ext.dash) ext.dash = false;
        if (ext.interact) ext.interact = false;

        // Jump buffer & coyote timer updates
        if (inputJumpJustPressed) {
          player.jumpBufferTimer = 0.14;
        } else if (player.jumpBufferTimer > 0) {
          player.jumpBufferTimer -= simDt;
        }

        if (player.isGrounded) {
          player.coyoteTimer = 0.12;
          player.jumpCount = 0;
        } else if (player.coyoteTimer > 0) {
          player.coyoteTimer -= simDt;
        }

        // Dash cooldown & timer
        if (player.dashCooldown > 0) player.dashCooldown -= simDt;
        if (player.isDashing) {
          player.dashTimer -= simDt;
          if (player.dashTimer <= 0) {
            player.isDashing = false;
          }
        } else if (inputDash && player.dashCooldown <= 0) {
          player.isDashing = true;
          player.dashTimer = 0.18;
          player.dashCooldown = 0.7;
          player.vx = player.facing * 520;
          player.vy = 0;
          sound.playJump();
          spawnParticles(player.x + player.w / 2, player.y + player.h / 2, 8, '#38bdf8', 140);
        }

        // Horizontal movement
        if (!player.isDashing) {
          if (inputLeft) {
            player.vx = -RUN_SPEED;
            player.facing = -1;
          } else if (inputRight) {
            player.vx = RUN_SPEED;
            player.facing = 1;
          } else {
            player.vx *= FRICTION;
            if (Math.abs(player.vx) < 5) player.vx = 0;
          }
        }

        // Jump Execution with Coyote Time and Jump Buffering
        if (player.jumpBufferTimer > 0) {
          if (player.coyoteTimer > 0 || player.jumpCount < 2) {
            player.vy = JUMP_SPEED;
            player.jumpBufferTimer = 0;
            player.coyoteTimer = 0;
            player.jumpCount++;
            player.isGrounded = false;
            player.squashX = 0.78;
            player.squashY = 1.25;
            sound.playJump();
            spawnParticles(player.x + player.w / 2, player.y + player.h, 6, '#e2e8f0', 80);
          }
        }

        // Variable jump cut when releasing jump button
        if (!inputJumpHeld && player.vy < -150) {
          player.vy *= 0.52;
        }

        // Apply gravity if not dashing
        if (!player.isDashing) {
          player.vy += GRAVITY * simDt;
          if (player.vy > 800) player.vy = 800; // Terminal velocity
        }

        // Smooth squash and stretch damping
        player.squashX += (1 - player.squashX) * Math.min(1, simDt * 12);
        player.squashY += (1 - player.squashY) * Math.min(1, simDt * 12);

        // Invulnerability timer
        if (player.invulnerableTimer > 0) {
          player.invulnerableTimer -= simDt;
        }

        // Update Moving Platforms
        state.movingPlatforms.forEach((mp) => {
          if (mp.moveRange) {
            mp.curX += (mp.speed || 50) * mp.dir * simDt;
            if (mp.moveRange.maxX && mp.curX >= mp.moveRange.maxX) {
              mp.curX = mp.moveRange.maxX;
              mp.dir = -1;
            } else if (mp.moveRange.minX && mp.curX <= mp.moveRange.minX) {
              mp.curX = mp.moveRange.minX;
              mp.dir = 1;
            }
          }
        });

        // ============ HORIZONTAL PHYSICS & COLLISION ============
        player.x += player.vx * simDt;
        if (player.x < 0) player.x = 0;
        if (player.x + player.w > level.worldWidth) player.x = level.worldWidth - player.w;

        // Check horizontal platform collisions
        const allPlatforms: PlatformDef[] = [
          ...level.platforms.filter((p) => p.type !== 'moving'),
          ...state.movingPlatforms.map((mp) => ({
            x: mp.curX,
            y: mp.curY,
            w: mp.w,
            h: mp.h,
            type: mp.type,
          })),
        ];

        allPlatforms.forEach((plat) => {
          if (checkAABB(player, plat)) {
            if (player.vx > 0) {
              player.x = plat.x - player.w;
            } else if (player.vx < 0) {
              player.x = plat.x + plat.w;
            }
            player.vx = 0;
          }
        });

        // ============ VERTICAL PHYSICS & COLLISION ============
        player.y += player.vy * simDt;
        player.isGrounded = false;

        allPlatforms.forEach((plat) => {
          if (checkAABB(player, plat)) {
            if (player.vy > 0) {
              // Landing on top
              player.y = plat.y - player.h;
              player.vy = 0;
              if (!player.isGrounded) {
                // Landing impact squash
                player.squashX = 1.22;
                player.squashY = 0.8;
                spawnParticles(player.x + player.w / 2, player.y + player.h, 4, '#cbd5e1', 60);
              }
              player.isGrounded = true;

              // Check bounce pad
              if (plat.type === 'bounce') {
                player.vy = -750;
                player.isGrounded = false;
                sound.playJump();
                spawnParticles(player.x + player.w / 2, player.y + player.h, 12, '#38bdf8', 160);
              }
            } else if (player.vy < 0) {
              // Hit ceiling
              player.y = plat.y + plat.h;
              player.vy = 0;
            }
          }
        });

        // Pit bottom check
        if (player.y > level.worldHeight + 100) {
          // Fall damage / respawn at checkpoint
          player.health--;
          sound.playHurt();
          state.cameraShake = 0.4;
          if (player.health <= 0) {
            player.lives--;
            if (player.lives <= 0) {
              state.isDefeated = true;
              onGameOver({ score: state.score });
            } else {
              player.health = player.maxHealth;
              player.x = state.checkpoint.x;
              player.y = state.checkpoint.y;
              player.vx = 0;
              player.vy = 0;
            }
          } else {
            player.x = state.checkpoint.x;
            player.y = state.checkpoint.y;
            player.vx = 0;
            player.vy = 0;
          }
        }

        // ============ ENEMY PATROLS & COMBAT ============
        state.enemies.forEach((enemy) => {
          if (enemy.hp <= 0) return;

          // Patrol AI
          enemy.x += enemy.speed * simDt;
          if (enemy.x > enemy.patrolMaxX) {
            enemy.x = enemy.patrolMaxX;
            enemy.speed = -Math.abs(enemy.speed);
          } else if (enemy.x < enemy.patrolMinX) {
            enemy.x = enemy.patrolMinX;
            enemy.speed = Math.abs(enemy.speed);
          }

          // Check interaction with player
          if (checkAABB(player, enemy)) {
            // Did player stomp on top of enemy?
            const isStomp = player.vy > 0 && player.y + player.h <= enemy.y + 18;
            if (isStomp || player.isDashing) {
              // Enemy defeated!
              enemy.hp = 0;
              player.vy = -380; // bounce
              state.score += 200;
              state.enemiesDefeated++;
              state.hitstopTimer = 0.05;
              state.cameraShake = 0.2;
              sound.playEnemyStomp();
              spawnParticles(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, 16, '#f43f5e', 140);
            } else if (player.invulnerableTimer <= 0) {
              // Player takes damage
              player.health--;
              player.invulnerableTimer = 1.2;
              player.vx = -player.facing * 180;
              player.vy = -200;
              state.hitstopTimer = 0.06;
              state.cameraShake = 0.35;
              sound.playHurt();
              spawnParticles(player.x + player.w / 2, player.y + player.h / 2, 10, '#e11d48', 120);

              if (player.health <= 0) {
                player.lives--;
                if (player.lives <= 0) {
                  state.isDefeated = true;
                  onGameOver({ score: state.score });
                } else {
                  player.health = player.maxHealth;
                  player.x = state.checkpoint.x;
                  player.y = state.checkpoint.y;
                  player.vx = 0;
                  player.vy = 0;
                }
              }
            }
          }
        });

        // ============ HAZARDS COLLISION ============
        level.hazards.forEach((hazard) => {
          // If laser barrier and terminal is solved, laser is deactivated!
          if (hazard.type === 'laser' && state.terminalSolved) {
            return;
          }

          if (checkAABB(player, hazard) && player.invulnerableTimer <= 0) {
            player.health--;
            player.invulnerableTimer = 1.2;
            player.vx = -player.facing * 160;
            player.vy = -220;
            state.hitstopTimer = 0.06;
            state.cameraShake = 0.35;
            sound.playHurt();
            spawnParticles(player.x + player.w / 2, player.y + player.h / 2, 8, '#f59e0b', 120);

            if (player.health <= 0) {
              player.lives--;
              if (player.lives <= 0) {
                state.isDefeated = true;
                onGameOver({ score: state.score });
              } else {
                player.health = player.maxHealth;
                player.x = state.checkpoint.x;
                player.y = state.checkpoint.y;
              }
            }
          }
        });

        // ============ COINS & GEMS COLLECTION ============
        state.coins.forEach((c) => {
          if (!c.collected && checkAABB(player, { x: c.x - 12, y: c.y - 12, w: 24, h: 24 })) {
            c.collected = true;
            state.coinsCollected++;
            state.score += c.value || 100;
            sound.playCoin();
            spawnParticles(c.x, c.y, 8, '#fbbf24', 90);
          }
        });

        // ============ KEYS COLLECTION ============
        state.keys.forEach((k: any) => {
          if (!k.collected && checkAABB(player, { x: k.x - 14, y: k.y - 14, w: 28, h: 28 })) {
            k.collected = true;
            state.hasKey = true;
            state.score += 500;
            sound.playKey();
            spawnParticles(k.x, k.y, 16, '#38bdf8', 130);
          }
        });

        // ============ CHECKPOINTS ============
        level.checkpoints.forEach((cp) => {
          if (Math.abs(player.x - cp.x) < 40 && Math.abs(player.y - cp.y) < 60) {
            if (state.checkpoint.x !== cp.x) {
              state.checkpoint = { x: cp.x, y: cp.y };
              sound.playCheckpoint();
              spawnParticles(cp.x, cp.y, 12, '#10b981', 100);
            }
          }
        });

        // ============ TERMINALS & PORTAL PROXIMITY ============
        let currentPrompt: string | null = null;
        let targetType: 'terminal' | 'portal' | null = null;

        // Check Terminals
        level.terminals.forEach((term) => {
          if (checkAABB(player, { x: term.x - 20, y: term.y - 10, w: term.w + 40, h: term.h + 20 })) {
            if (!state.terminalSolved) {
              currentPrompt = `Hack ${term.label}`;
              targetType = 'terminal';
              if (inputInteract) {
                onOpenTerminal();
              }
            }
          }
        });

        // Check Exit Portal
        const portalArea = {
          x: level.portalPoint.x - 30,
          y: level.portalPoint.y - 30,
          w: 60,
          h: 80,
        };
        if (checkAABB(player, portalArea)) {
          if (state.terminalSolved && (!level.totalKeys || state.hasKey)) {
            currentPrompt = 'Enter World Portal';
            targetType = 'portal';
            if (inputInteract) {
              // VICTORY!
              state.isComplete = true;
              sound.playVictory();
              spawnParticles(level.portalPoint.x, level.portalPoint.y, 30, '#38bdf8', 180);
              onLevelComplete({
                score: state.score,
                coinsCollected: state.coinsCollected,
                timeTakenSec: Math.round(state.timeTakenSec),
                livesRemaining: player.lives,
                enemiesDefeated: state.enemiesDefeated,
              });
            }
          } else {
            currentPrompt = 'Portal Locked! Solve Terminal & Collect Key';
          }
        }

        state.interactableTarget = targetType;

        // Throttle HUD update to ~10 times per second to prevent React lag
        hudThrottleTime += dt;
        if (hudThrottleTime > 0.1) {
          hudThrottleTime = 0;
          onUpdateHud({
            health: player.health,
            lives: player.lives,
            score: state.score,
            coins: state.coinsCollected,
            hasKey: state.hasKey,
            interactPrompt: currentPrompt,
          });
        }
      }

      // Update Particles
      particlesRef.current.forEach((p) => {
        if (p.active) {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += 200 * dt;
          p.life += dt;
          if (p.life >= p.maxLife) {
            p.active = false;
          }
        }
      });

      // Update Camera (Smooth tracking with bounds clamping)
      const targetCamX = player.x - canvas.width / 2;
      const targetCamY = player.y - canvas.height / 2;
      state.camX += (targetCamX - state.camX) * Math.min(1, dt * 6);
      state.camY += (targetCamY - state.camY) * Math.min(1, dt * 6);

      // Clamp camera
      state.camX = Math.max(0, Math.min(level.worldWidth - canvas.width, state.camX));
      state.camY = Math.max(-100, Math.min(level.worldHeight - canvas.height + 150, state.camY));

      // Camera Shake decay
      let shakeOffsetX = 0;
      let shakeOffsetY = 0;
      if (state.cameraShake > 0) {
        state.cameraShake = Math.max(0, state.cameraShake - dt * 2);
        const intensity = state.cameraShake * 14;
        shakeOffsetX = (Math.random() - 0.5) * intensity;
        shakeOffsetY = (Math.random() - 0.5) * intensity;
      }

      // ==========================================
      // RENDER PASS (2D HTML5 Canvas)
      // ==========================================
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(-state.camX + shakeOffsetX, -state.camY + shakeOffsetY);

      // 1. Light Modern Sky Gradient & Distant Tech City Skyline
      renderBackground(ctx, canvas, level, state.camX, state.camY);

      // 2. Platforms
      renderPlatforms(ctx, level.platforms, state.movingPlatforms);

      // 3. Hazards (Spikes, Lasers)
      renderHazards(ctx, level.hazards, state.terminalSolved, currentTime);

      // 4. Terminals & Checkpoints
      renderTerminals(ctx, level.terminals, level.checkpoints, state.terminalSolved, state.checkpoint);

      // 5. Collectibles (Coins, Gems, Keys)
      renderCollectibles(ctx, state.coins, state.keys, currentTime);

      // 6. Enemies
      renderEnemies(ctx, state.enemies, currentTime);

      // 7. Exit Portal
      renderPortal(ctx, level.portalPoint, state.terminalSolved && (!level.totalKeys || state.hasKey), currentTime);

      // 8. Player Character
      renderPlayer(ctx, player, currentTime);

      // 9. Particle pool
      renderParticles(ctx, particlesRef.current);

      ctx.restore();

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [level, isPaused]);

  // Handle terminal solve callback
  const handleTerminalSolved = useCallback(() => {
    simState.current.terminalSolved = true;
    simState.current.score += 1500;
  }, []);

  // Expose terminal solve method to parent
  useEffect(() => {
    (window as any).__techquest_solve_terminal = handleTerminalSolved;
    return () => {
      delete (window as any).__techquest_solve_terminal;
    };
  }, [handleTerminalSolved]);

  // Handle window resizing
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full block bg-slate-50 cursor-crosshair select-none"
      data-testid="game-canvas"
    />
  );
};

// ==========================================
// VECTOR RENDERING HELPERS
// ==========================================

function renderBackground(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  level: LevelConfig,
  camX: number,
  camY: number
) {
  const world = WORLDS[level.worldId];

  // Draw cyber grid lines in background
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  const gridSize = 64;
  const startX = Math.floor(camX / gridSize) * gridSize;
  const endX = camX + canvas.width + gridSize;
  for (let x = startX; x <= endX; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, camY - 100);
    ctx.lineTo(x, camY + canvas.height + 100);
    ctx.stroke();
  }

  // Distant parallax data pillars
  const pillarSpacing = 280;
  for (let px = 0; px < level.worldWidth; px += pillarSpacing) {
    const pX = px - camX * 0.25;
    ctx.fillStyle = 'rgba(2, 132, 199, 0.04)';
    ctx.fillRect(pX, 220, 60, 480);
    ctx.fillStyle = 'rgba(2, 132, 199, 0.08)';
    ctx.fillRect(pX + 15, 200, 30, 20);
  }
}

function renderPlatforms(
  ctx: CanvasRenderingContext2D,
  platforms: PlatformDef[],
  movingPlatforms: any[]
) {
  const all = [
    ...platforms.filter((p) => p.type !== 'moving'),
    ...movingPlatforms.map((mp) => ({
      x: mp.curX,
      y: mp.curY,
      w: mp.w,
      h: mp.h,
      type: mp.type,
    })),
  ];

  all.forEach((plat) => {
    // Platform body
    if (plat.type === 'bounce') {
      ctx.fillStyle = '#f0fdf4';
      ctx.strokeStyle = '#22c55e';
    } else if (plat.type === 'glass') {
      ctx.fillStyle = '#f0fdfa';
      ctx.strokeStyle = '#14b8a6';
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#38bdf8';
    }

    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(plat.x, plat.y, plat.w, plat.h, 6);
    ctx.fill();
    ctx.stroke();

    // Circuit trace on top edge
    ctx.fillStyle = plat.type === 'bounce' ? '#22c55e' : '#0284c7';
    ctx.fillRect(plat.x + 4, plat.y, plat.w - 8, 3);

    // Decorative circuit nodes
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(plat.x + 12, plat.y + plat.h / 2, 2.5, 0, Math.PI * 2);
    ctx.arc(plat.x + plat.w - 12, plat.y + plat.h / 2, 2.5, 0, Math.PI * 2);
    ctx.fill();
  });
}

function renderHazards(
  ctx: CanvasRenderingContext2D,
  hazards: HazardDef[],
  terminalSolved: boolean,
  time: number
) {
  hazards.forEach((h) => {
    if (h.type === 'spikes') {
      // Draw warning spikes
      ctx.fillStyle = '#ef4444';
      const spikeCount = Math.floor(h.w / 16);
      for (let i = 0; i < spikeCount; i++) {
        const sx = h.x + i * 16;
        ctx.beginPath();
        ctx.moveTo(sx, h.y + h.h);
        ctx.lineTo(sx + 8, h.y);
        ctx.lineTo(sx + 16, h.y + h.h);
        ctx.closePath();
        ctx.fill();
      }
    } else if (h.type === 'laser') {
      if (terminalSolved) {
        // Laser deactivated!
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(h.x + h.w / 2, h.y);
        ctx.lineTo(h.x + h.w / 2, h.y + h.h);
        ctx.stroke();
      } else {
        // Active glowing laser barrier
        const pulse = Math.sin(time / 100) * 0.3 + 0.7;
        ctx.strokeStyle = `rgba(239, 68, 68, ${pulse})`;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(h.x + h.w / 2, h.y);
        ctx.lineTo(h.x + h.w / 2, h.y + h.h);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  });
}

function renderTerminals(
  ctx: CanvasRenderingContext2D,
  terminals: any[],
  checkpoints: any[],
  terminalSolved: boolean,
  currentCp: { x: number; y: number }
) {
  // Checkpoints
  checkpoints.forEach((cp) => {
    const isActive = currentCp.x === cp.x;
    ctx.fillStyle = isActive ? '#10b981' : '#cbd5e1';
    ctx.fillRect(cp.x - 2, cp.y - 40, 4, 40);
    // Flag
    ctx.beginPath();
    ctx.moveTo(cp.x + 2, cp.y - 40);
    ctx.lineTo(cp.x + 22, cp.y - 30);
    ctx.lineTo(cp.x + 2, cp.y - 20);
    ctx.closePath();
    ctx.fill();
  });

  // Terminals
  terminals.forEach((term) => {
    // Computer terminal pedestal
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(term.x, term.y + term.h - 10, term.w, 10, 3);
    ctx.fill();

    // Screen
    ctx.fillStyle = terminalSolved ? '#10b981' : '#0284c7';
    ctx.beginPath();
    ctx.roundRect(term.x + 4, term.y, term.w - 8, term.h - 14, 6);
    ctx.fill();

    // Display glow
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(terminalSolved ? 'UNLOCKED' : '</> RUN', term.x + term.w / 2, term.y + 22);
  });
}

function renderCollectibles(
  ctx: CanvasRenderingContext2D,
  coins: CoinDef[],
  keys: any[],
  time: number
) {
  const bob = Math.sin(time / 200) * 4;

  // Coins & Gems
  coins.forEach((c) => {
    if (c.collected) return;
    const cy = c.y + bob;

    if (c.type === 'gem') {
      // Crystal diamond
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(c.x, cy - 10);
      ctx.lineTo(c.x + 9, cy);
      ctx.lineTo(c.x, cy + 10);
      ctx.lineTo(c.x - 9, cy);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(c.x, cy - 8);
      ctx.lineTo(c.x + 4, cy);
      ctx.lineTo(c.x, cy + 2);
      ctx.closePath();
      ctx.fill();
    } else {
      // Spinning gold coin
      const scaleX = Math.cos(time / 250);
      ctx.save();
      ctx.translate(c.x, cy);
      ctx.scale(scaleX, 1);

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  });

  // Keys
  keys.forEach((k: any) => {
    if (k.collected) return;
    const ky = k.y + bob;

    ctx.fillStyle = '#0ea5e9';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;

    // Key body
    ctx.beginPath();
    ctx.arc(k.x - 6, ky, 7, 0, Math.PI * 2);
    ctx.rect(k.x - 2, ky - 2.5, 16, 5);
    ctx.rect(k.x + 8, ky, 3, 6);
    ctx.rect(k.x + 13, ky, 3, 4);
    ctx.fill();
    ctx.stroke();
  });
}

function renderEnemies(ctx: CanvasRenderingContext2D, enemies: EnemyDef[], time: number) {
  enemies.forEach((enemy) => {
    if (enemy.hp <= 0) return;

    if (enemy.type === 'syntax_bug') {
      // Crawling Cyber Beetle / Bug
      ctx.fillStyle = '#e11d48';
      ctx.beginPath();
      ctx.roundRect(enemy.x, enemy.y + 8, enemy.w, enemy.h - 8, 8);
      ctx.fill();

      // Antennae
      const wiggle = Math.sin(time / 120) * 3;
      ctx.strokeStyle = '#9f1239';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(enemy.x + 8, enemy.y + 8);
      ctx.lineTo(enemy.x + 2 + wiggle, enemy.y);
      ctx.moveTo(enemy.x + enemy.w - 8, enemy.y + 8);
      ctx.lineTo(enemy.x + enemy.w - 2 - wiggle, enemy.y);
      ctx.stroke();

      // Glitch eyes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(enemy.x + 10, enemy.y + 16, 3, 0, Math.PI * 2);
      ctx.arc(enemy.x + enemy.w - 10, enemy.y + 16, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (enemy.type === 'packet_dropper') {
      // Floating Drone
      const floatY = Math.sin(time / 200) * 4;
      ctx.fillStyle = '#0f766e';
      ctx.beginPath();
      ctx.arc(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2 + floatY, 14, 0, Math.PI * 2);
      ctx.fill();

      // Rotating radar wing
      ctx.fillStyle = '#2dd4bf';
      ctx.fillRect(enemy.x - 4, enemy.y + enemy.h / 2 + floatY - 2, enemy.w + 8, 4);
    } else {
      // Glitch Phantom
      ctx.fillStyle = '#7c3aed';
      ctx.beginPath();
      ctx.roundRect(enemy.x, enemy.y, enemy.w, enemy.h, 10);
      ctx.fill();
      ctx.fillStyle = '#c4b5fd';
      ctx.fillRect(enemy.x + 8, enemy.y + 12, enemy.w - 16, 4);
    }
  });
}

function renderPortal(
  ctx: CanvasRenderingContext2D,
  portalPoint: { x: number; y: number },
  isOpen: boolean,
  time: number
) {
  const rot = time / 350;

  ctx.save();
  ctx.translate(portalPoint.x, portalPoint.y);

  // Outer ring
  ctx.strokeStyle = isOpen ? '#0284c7' : '#94a3b8';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, 28, 0, Math.PI * 2);
  ctx.stroke();

  // Swirling vortex rays
  if (isOpen) {
    ctx.rotate(rot);
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.beginPath();
      ctx.arc(12, 0, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

function renderPlayer(ctx: CanvasRenderingContext2D, player: PlayerState, time: number) {
  // Invulnerability flashing
  if (player.invulnerableTimer > 0 && Math.floor(time / 80) % 2 === 0) {
    return;
  }

  ctx.save();
  const centerX = player.x + player.w / 2;
  const bottomY = player.y + player.h;

  ctx.translate(centerX, bottomY);
  ctx.scale(player.facing * player.squashX, player.squashY);

  // Trail effect when dashing
  if (player.isDashing) {
    ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.fillRect(-player.w / 2 - 12, -player.h, player.w, player.h);
  }

  // Feet walking bob
  const isWalking = Math.abs(player.vx) > 10 && player.isGrounded;
  const walkBob = isWalking ? Math.sin(time / 80) * 4 : 0;

  // Player Coat / Body (Modern Azure Blue)
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.roundRect(-player.w / 2, -player.h + 12, player.w, player.h - 18, 6);
  ctx.fill();

  // Inner White Tech Shirt
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-player.w / 4, -player.h + 14, player.w / 2, 10);

  // Tech Backpack
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(-player.w / 2 - 4, -player.h + 16, 5, 14, 2);
  ctx.fill();

  // Head
  ctx.fillStyle = '#fed7aa'; // Skin tone
  ctx.beginPath();
  ctx.arc(0, -player.h + 10, 9, 0, Math.PI * 2);
  ctx.fill();

  // Cyber Goggles / Visor
  ctx.fillStyle = '#38bdf8';
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(-2, -player.h + 8, 10, 6, 2);
  ctx.fill();
  ctx.stroke();

  // Hair
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.arc(0, -player.h + 4, 8, Math.PI, 0);
  ctx.fill();

  // Feet
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-player.w / 2 + 2, -6 + walkBob, 8, 6);
  ctx.fillRect(player.w / 2 - 10, -6 - walkBob, 8, 6);

  ctx.restore();
}

function renderParticles(ctx: CanvasRenderingContext2D, pool: Particle[]) {
  pool.forEach((p) => {
    if (p.active) {
      const alpha = 1 - p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  ctx.globalAlpha = 1;
}
