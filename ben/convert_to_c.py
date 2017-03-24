# python convert_to_c.py build_ext --inplace

from distutils.core import setup
from Cython.Build import cythonize

setup(
    ext_modules = cythonize("radiiByIndustryByCity.pyx")
)