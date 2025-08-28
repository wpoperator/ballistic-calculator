#!/usr/bin/env python3
"""
Debug script to test py-ballisticcalc import
"""
import sys
import importlib.util

def test_import():
    print(f"Python version: {sys.version}")
    print(f"Python path: {sys.path}")
    
    # Test if the package is installed
    spec = importlib.util.find_spec("py_ballisticcalc")
    if spec is None:
        print("❌ py_ballisticcalc package not found")
        return False
    else:
        print(f"✅ py_ballisticcalc package found at: {spec.origin}")
    
    # Try to import the main module
    try:
        import py_ballisticcalc
        print(f"✅ py_ballisticcalc imported successfully")
        print(f"   Package location: {py_ballisticcalc.__file__}")
        print(f"   Package version: {getattr(py_ballisticcalc, '__version__', 'unknown')}")
    except Exception as e:
        print(f"❌ Failed to import py_ballisticcalc: {e}")
        return False
    
    # Try to import specific components
    try:
        from py_ballisticcalc import Calculator, DragModel, Ammo, Weapon, Atmo, Shot, Wind
        print("✅ Core classes imported successfully")
    except Exception as e:
        print(f"❌ Failed to import core classes: {e}")
        return False
    
    # Try to import units
    try:
        from py_ballisticcalc.unit import Distance, Velocity, Temperature, Weight, Pressure, Angular, Energy
        print("✅ Unit classes imported successfully")
    except Exception as e:
        print(f"❌ Failed to import unit classes: {e}")
        return False
    
    # Try to import drag tables
    try:
        from py_ballisticcalc import TableG1, TableG7
        print("✅ Drag tables imported successfully")
    except Exception as e:
        print(f"❌ Failed to import drag tables: {e}")
        return False
    
    print("🎉 All imports successful!")
    return True

if __name__ == "__main__":
    success = test_import()
    sys.exit(0 if success else 1)
