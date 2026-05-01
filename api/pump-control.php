<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../koneksi.php';

// Buat tabel pump_control jika belum ada
$table_sql = "CREATE TABLE IF NOT EXISTS pump_control (
    id INT(1) UNSIGNED PRIMARY KEY DEFAULT 1,
    is_active TINYINT(1) NOT NULL DEFAULT 0,
    mode ENUM('auto','manual') NOT NULL DEFAULT 'auto',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)";
$conn->query($table_sql);

// Pastikan selalu ada baris dengan id=1
$conn->query("INSERT IGNORE INTO pump_control (id, is_active, mode) VALUES (1, 0, 'auto')");

// ── GET: baca status pompa ────────────────────────────────────────────────────
if ($_SERVER["REQUEST_METHOD"] === "GET") {
    $result = $conn->query("SELECT is_active, mode, updated_at FROM pump_control WHERE id = 1");
    if ($result && $row = $result->fetch_assoc()) {
        echo json_encode([
            "is_active"  => (bool)$row['is_active'],
            "mode"       => $row['mode'],
            "updated_at" => $row['updated_at'],
        ]);
    } else {
        echo json_encode(["is_active" => false, "mode" => "auto", "updated_at" => null]);
    }
    $conn->close();
    exit();
}

// ── POST: ubah status pompa ───────────────────────────────────────────────────
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if ($data === null) {
        http_response_code(400);
        echo json_encode(["message" => "Body JSON tidak valid"]);
        $conn->close();
        exit();
    }

    $mode      = isset($data['mode'])      ? $conn->real_escape_string($data['mode'])      : 'manual';
    $is_active = isset($data['is_active']) ? ($data['is_active'] ? 1 : 0) : 0;

    // Validasi mode
    if (!in_array($mode, ['auto', 'manual'])) {
        http_response_code(400);
        echo json_encode(["message" => "Mode tidak valid. Gunakan 'auto' atau 'manual'"]);
        $conn->close();
        exit();
    }

    $sql = "UPDATE pump_control SET is_active = $is_active, mode = '$mode' WHERE id = 1";
    if ($conn->query($sql) === TRUE) {
        echo json_encode([
            "message"   => "Status pompa berhasil diperbarui",
            "is_active" => (bool)$is_active,
            "mode"      => $mode,
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Gagal memperbarui: " . $conn->error]);
    }

    $conn->close();
    exit();
}

http_response_code(405);
echo json_encode(["message" => "Metode tidak diizinkan"]);
$conn->close();
?>
