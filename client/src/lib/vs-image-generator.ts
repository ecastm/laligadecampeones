import type { Match, Team, Tournament, Division, MatchStage } from "@shared/schema";
import { MatchStageLabels } from "@shared/schema";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface VsImageData {
  match: Match;
  homeTeam: Team;
  awayTeam: Team;
  tournament?: Tournament;
  division?: Division;
  ligaLogoSrc: string;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text];
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = (current + " " + word).trim();
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function generateVsImageToCanvas(canvas: HTMLCanvasElement, data: VsImageData): Promise<void> {
  const { match, homeTeam, awayTeam, tournament, division, ligaLogoSrc } = data;
  const W = 1080;
  const H = 1080;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const cx = W / 2;

  const darkGreen = "#031D0A";
  const medGreen = "#0A4A1F";
  const brightGreen = "#0F6B2E";
  const gold = "#D4A824";
  const lightGold = "#F0D060";
  const brightGold = "#FFE066";
  const white = "#FFFFFF";

  const bgGrad = ctx.createRadialGradient(cx, H * 0.45, 0, cx, H * 0.45, H * 0.85);
  bgGrad.addColorStop(0, brightGreen);
  bgGrad.addColorStop(0.5, medGreen);
  bgGrad.addColorStop(1, darkGreen);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.globalAlpha = 0.04;
  ctx.strokeStyle = gold;
  ctx.lineWidth = 1;
  for (let i = -W; i < W * 2; i += 50) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + H * 0.3, H);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(i + H * 0.3, 0);
    ctx.lineTo(i, H);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.strokeStyle = lightGold;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, H * 0.48, 250, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, H * 0.48, 320, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  const topBarH = 180;
  const topGrad = ctx.createLinearGradient(0, 0, 0, topBarH);
  topGrad.addColorStop(0, darkGreen);
  topGrad.addColorStop(0.7, darkGreen + "EE");
  topGrad.addColorStop(1, "transparent");
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, W, topBarH);

  const goldLineGrad = ctx.createLinearGradient(0, topBarH - 4, W, topBarH - 4);
  goldLineGrad.addColorStop(0, "transparent");
  goldLineGrad.addColorStop(0.15, gold);
  goldLineGrad.addColorStop(0.85, gold);
  goldLineGrad.addColorStop(1, "transparent");
  ctx.strokeStyle = goldLineGrad;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, topBarH - 2);
  ctx.lineTo(W, topBarH - 2);
  ctx.stroke();

  try {
    const logoImg = await loadImage(ligaLogoSrc);
    ctx.drawImage(logoImg, cx - 45, 18, 90, 90);
  } catch {}

  ctx.fillStyle = brightGold;
  ctx.font = "900 38px 'Segoe UI', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("LA LIGA DE CAMPEONES", cx, 148);

  const roundY = 230;
  const stageLabel = match.stage && match.stage !== "JORNADA"
    ? (MatchStageLabels[match.stage as MatchStage] || match.stage).toUpperCase()
    : null;
  const roundText = stageLabel || `JORNADA ${match.roundNumber}`;
  ctx.font = "900 42px 'Segoe UI', Arial, sans-serif";
  const roundW = ctx.measureText(roundText).width + 80;
  const roundH = 58;

  const pillGrad = ctx.createLinearGradient(cx - roundW / 2, roundY - roundH / 2, cx + roundW / 2, roundY + roundH / 2);
  pillGrad.addColorStop(0, gold);
  pillGrad.addColorStop(0.5, lightGold);
  pillGrad.addColorStop(1, gold);
  ctx.fillStyle = pillGrad;
  roundRect(ctx, cx - roundW / 2, roundY - roundH / 2, roundW, roundH, roundH / 2);
  ctx.fill();

  ctx.fillStyle = darkGreen;
  ctx.font = "900 36px 'Segoe UI', Arial, sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText(roundText, cx, roundY + 1);
  ctx.textBaseline = "alphabetic";

  if (division) {
    ctx.fillStyle = gold + "BB";
    ctx.font = "600 24px 'Segoe UI', Arial, sans-serif";
    ctx.fillText(division.name.toUpperCase(), cx, roundY + 52);
  }

  const teamCenterY = 500;
  const teamSpacing = 260;
  const logoSize = 200;

  const drawTeamLogo = async (teamLogoUrl: string | undefined | null, x: number, y: number, size: number) => {
    ctx.save();
    ctx.shadowColor = gold + "60";
    ctx.shadowBlur = 30;
    const outerGrad = ctx.createRadialGradient(x, y, size / 2 - 5, x, y, size / 2 + 8);
    outerGrad.addColorStop(0, gold);
    outerGrad.addColorStop(1, gold + "00");
    ctx.fillStyle = outerGrad;
    ctx.beginPath();
    ctx.arc(x, y, size / 2 + 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (teamLogoUrl) {
      try {
        const img = await loadImage(teamLogoUrl);
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
        ctx.restore();
      } catch {
        drawFallbackLogo(ctx, x, y, size);
      }
    } else {
      drawFallbackLogo(ctx, x, y, size);
    }

    ctx.strokeStyle = gold;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.stroke();
  };

  const drawFallbackLogo = (c: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    const fbGrad = c.createRadialGradient(x, y - size * 0.1, 0, x, y, size / 2);
    fbGrad.addColorStop(0, medGreen);
    fbGrad.addColorStop(1, darkGreen);
    c.fillStyle = fbGrad;
    c.beginPath();
    c.arc(x, y, size / 2, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = brightGold;
    c.font = "900 60px 'Segoe UI', Arial, sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("FC", x, y);
    c.textBaseline = "alphabetic";
  };

  await drawTeamLogo(homeTeam.logoUrl || undefined, cx - teamSpacing, teamCenterY, logoSize);
  await drawTeamLogo(awayTeam.logoUrl || undefined, cx + teamSpacing, teamCenterY, logoSize);

  const nameY = teamCenterY + logoSize / 2 + 50;
  ctx.fillStyle = white;
  ctx.font = "900 42px 'Segoe UI', Arial, sans-serif";
  ctx.textAlign = "center";
  const homeLines = wrapText(homeTeam.name.toUpperCase(), 12);
  homeLines.forEach((line, i) => {
    ctx.fillText(line, cx - teamSpacing, nameY + i * 48);
  });
  const awayLines = wrapText(awayTeam.name.toUpperCase(), 12);
  awayLines.forEach((line, i) => {
    ctx.fillText(line, cx + teamSpacing, nameY + i * 48);
  });

  const vsY = teamCenterY;
  const vsRadius = 72;

  ctx.save();
  ctx.shadowColor = brightGold + "80";
  ctx.shadowBlur = 40;
  const vsOuterGrad = ctx.createRadialGradient(cx, vsY, vsRadius - 5, cx, vsY, vsRadius + 15);
  vsOuterGrad.addColorStop(0, brightGold + "50");
  vsOuterGrad.addColorStop(1, "transparent");
  ctx.fillStyle = vsOuterGrad;
  ctx.beginPath();
  ctx.arc(cx, vsY, vsRadius + 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const vsBgGrad = ctx.createRadialGradient(cx, vsY - 15, 0, cx, vsY, vsRadius);
  vsBgGrad.addColorStop(0, lightGold);
  vsBgGrad.addColorStop(0.6, gold);
  vsBgGrad.addColorStop(1, "#8B7518");
  ctx.fillStyle = vsBgGrad;
  ctx.beginPath();
  ctx.arc(cx, vsY, vsRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = brightGold;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, vsY, vsRadius - 6, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = darkGreen;
  ctx.font = "900 68px 'Segoe UI', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("VS", cx, vsY + 2);
  ctx.textBaseline = "alphabetic";

  if (match.status === "JUGADO" && match.homeScore !== undefined && match.awayScore !== undefined) {
    const scoreY = teamCenterY - logoSize / 2 - 45;
    ctx.save();
    ctx.shadowColor = brightGold + "80";
    ctx.shadowBlur = 20;
    ctx.fillStyle = brightGold;
    ctx.font = "900 90px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(String(match.homeScore), cx - teamSpacing, scoreY);
    ctx.fillText(String(match.awayScore), cx + teamSpacing, scoreY);
    ctx.restore();
  }

  const infoY = 820;
  const infoH = 150;
  const infoW = 700;

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 25;
  const infoBgGrad = ctx.createLinearGradient(cx - infoW / 2, infoY, cx + infoW / 2, infoY + infoH);
  infoBgGrad.addColorStop(0, darkGreen + "F0");
  infoBgGrad.addColorStop(1, "#021508F0");
  ctx.fillStyle = infoBgGrad;
  roundRect(ctx, cx - infoW / 2, infoY, infoW, infoH, 20);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = gold + "80";
  ctx.lineWidth = 2;
  roundRect(ctx, cx - infoW / 2, infoY, infoW, infoH, 20);
  ctx.stroke();

  const matchDate = new Date(match.dateTime);
  const hasValidDate = match.dateTime && !isNaN(matchDate.getTime()) && matchDate.getFullYear() > 2000;

  if (hasValidDate) {
    ctx.fillStyle = brightGold;
    ctx.font = "900 34px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(format(matchDate, "EEEE d 'de' MMMM", { locale: es }).toUpperCase(), cx, infoY + 48);

    ctx.fillStyle = white;
    ctx.font = "700 30px 'Segoe UI', Arial, sans-serif";
    const timeText = format(matchDate, "HH:mm", { locale: es }) + " HRS";
    const fieldText = match.field && match.field !== "Por asignar" ? `  |  ${match.field.toUpperCase()}` : "";
    ctx.fillText(timeText + fieldText, cx, infoY + 95);
  } else {
    ctx.fillStyle = brightGold;
    ctx.font = "900 34px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("FECHA POR CONFIRMAR", cx, infoY + 65);

    if (match.field && match.field !== "Por asignar") {
      ctx.fillStyle = white;
      ctx.font = "700 30px 'Segoe UI', Arial, sans-serif";
      ctx.fillText(match.field.toUpperCase(), cx, infoY + 105);
    }
  }

  if (tournament) {
    ctx.fillStyle = gold + "90";
    ctx.font = "600 22px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(tournament.name.toUpperCase(), cx, infoY + 130);
  }

  const bottomY = 1010;
  const btmLineGrad = ctx.createLinearGradient(0, bottomY, W, bottomY);
  btmLineGrad.addColorStop(0, "transparent");
  btmLineGrad.addColorStop(0.1, gold + "60");
  btmLineGrad.addColorStop(0.5, gold);
  btmLineGrad.addColorStop(0.9, gold + "60");
  btmLineGrad.addColorStop(1, "transparent");
  ctx.strokeStyle = btmLineGrad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, bottomY);
  ctx.lineTo(W, bottomY);
  ctx.stroke();

  ctx.fillStyle = gold + "AA";
  ctx.font = "600 22px 'Segoe UI', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("www.laligadecampeones.com", cx - 100, bottomY + 38);
  ctx.fillStyle = lightGold + "88";
  ctx.fillText("@laligadecampeones", cx + 180, bottomY + 38);
}

export async function generateVsImageBlob(data: VsImageData): Promise<Blob> {
  const canvas = document.createElement("canvas");
  await generateVsImageToCanvas(canvas, data);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to create blob from canvas"));
    }, "image/png");
  });
}

export async function uploadVsImage(blob: Blob, matchId: string): Promise<string> {
  const token = localStorage.getItem("auth_token");
  const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
  const requestRes = await fetch("/api/uploads/request-url", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify({
      name: `vs-match-${matchId}.png`,
      size: blob.size,
      contentType: "image/png",
    }),
  });
  if (!requestRes.ok) throw new Error("Failed to get upload URL");
  const { uploadURL, objectPath } = await requestRes.json();

  const uploadRes = await fetch(uploadURL, {
    method: "PUT",
    body: blob,
    headers: { "Content-Type": "image/png" },
  });
  if (!uploadRes.ok) throw new Error("Failed to upload image");

  return objectPath;
}
