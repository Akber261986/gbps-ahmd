"""
Quick test script for cluster management system
Run this after starting the backend server
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_cluster_endpoints():
    print("=" * 60)
    print("Testing Cluster Management System")
    print("=" * 60)

    # Note: These tests require authentication
    # You'll need to get a token first by logging in

    print("\n1. Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print("   ✓ Backend is running")
    except Exception as e:
        print(f"   ✗ Error: {e}")
        return

    print("\n2. Testing API docs...")
    try:
        response = requests.get(f"{BASE_URL}/docs")
        if response.status_code == 200:
            print("   ✓ API documentation accessible at http://localhost:8000/docs")
    except Exception as e:
        print(f"   ✗ Error: {e}")

    print("\n3. Cluster endpoints available:")
    print("   POST   /api/clusters              - Create cluster")
    print("   GET    /api/clusters              - List clusters")
    print("   GET    /api/clusters/{id}         - Get cluster")
    print("   PUT    /api/clusters/{id}         - Update cluster")
    print("   DELETE /api/clusters/{id}         - Delete cluster")
    print("   GET    /api/clusters/{id}/stats   - Get statistics")
    print("   GET    /api/clusters/{id}/schools - Get schools")
    print("   GET    /api/clusters/{id}/students - Get students")

    print("\n" + "=" * 60)
    print("Next Steps:")
    print("=" * 60)
    print("1. Login to get authentication token")
    print("2. Use token to test cluster endpoints")
    print("3. Create a super admin user in database")
    print("4. Access /dashboard/admin to create clusters")
    print("\nTo create super admin:")
    print("  UPDATE users SET role = 'SUPER_ADMIN' WHERE email = 'your@email.com';")
    print("=" * 60)

if __name__ == "__main__":
    test_cluster_endpoints()
