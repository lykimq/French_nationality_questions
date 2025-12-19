if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "/home/quyen/.gradle/caches/8.14.3/transforms/4d2b3738cc2c54e915edbca9542c1fe3/transformed/hermes-android-0.81.5-debug/prefab/modules/libhermes/libs/android.x86_64/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "/home/quyen/.gradle/caches/8.14.3/transforms/4d2b3738cc2c54e915edbca9542c1fe3/transformed/hermes-android-0.81.5-debug/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

